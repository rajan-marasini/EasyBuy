package review

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Repository interface {
	GetProductReviews(ctx context.Context, productId string, page, limit int) ([]models.Review, int64, error)
	Create(ctx context.Context, review models.Review) (*models.Review, error)
	Update(ctx context.Context, review models.Review, reviewId string) (*models.Review, error)
	Delete(ctx context.Context, reviewId string) (bool, error)
}

func (r *repository) clearCache(ctx context.Context, productId string) {
	pattern := fmt.Sprintf("reviews:product:%s:page:*", productId)
	iter := r.redis.Scan(ctx, 0, pattern, 0).Iterator()
	for iter.Next(ctx) {
		r.redis.Del(ctx, iter.Val())
	}
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, rdb *redis.Client) Repository {
	return &repository{db, rdb}
}

type reviewCacheData struct {
	Reviews []models.Review `json:"reviews"`
	Total   int64           `json:"total"`
}

func (r *repository) GetProductReviews(ctx context.Context, productId string, page, limit int) ([]models.Review, int64, error) {
	cacheKey := fmt.Sprintf("reviews:product:%s:page:%d:limit:%d", productId, page, limit)

	// Try fetching from cache
	val, err := r.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var cachedData reviewCacheData
		if err := json.Unmarshal([]byte(val), &cachedData); err == nil {
			log.Println("Cache hit for", cacheKey)
			return cachedData.Reviews, cachedData.Total, nil
		}
	}

	var reviews []models.Review
	var total int64

	offset := (page - 1) * limit

	// Count total reviews for the product
	if err := r.db.WithContext(ctx).Model(&models.Review{}).Where("product_id = ?", productId).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Fetch paginated reviews with user info
	if err := r.db.WithContext(ctx).
		Where("product_id = ?", productId).
		Preload("User").
		Offset(offset).
		Limit(limit).
		Order("created_at desc").
		Find(&reviews).Error; err != nil {
		return nil, 0, err
	}

	// Store in cache
	log.Println("Cache miss for", cacheKey)
	cacheData := reviewCacheData{
		Reviews: reviews,
		Total:   total,
	}

	if dataBytes, err := json.Marshal(cacheData); err == nil {
		r.redis.Set(ctx, cacheKey, dataBytes, time.Hour)
	}

	return reviews, total, nil
}

func (r *repository) Create(ctx context.Context, review models.Review) (*models.Review, error) {
	if err := r.db.WithContext(ctx).Model(&models.Review{}).Create(&review).Error; err != nil {
		return nil, err
	}

	r.clearCache(ctx, review.ProductID.String())

	return &review, nil
}

func (r *repository) Update(ctx context.Context, review models.Review, reviewId string) (*models.Review, error) {
	result := r.db.
		WithContext(ctx).
		Model(&models.Review{}).
		Where("id = ?", reviewId).
		Updates(review)

	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
		return nil, errors.New("review id not found")
	}

	r.clearCache(ctx, review.ProductID.String())

	return &review, nil
}

func (r *repository) Delete(ctx context.Context, reviewId string) (bool, error) {
	var review models.Review

	if err := r.db.WithContext(ctx).First(&review, "id = ?", reviewId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, errors.New("review id not found")
		}
		return false, err
	}

	if err := r.db.WithContext(ctx).Delete(&review).Error; err != nil {
		return false, err
	}

	r.clearCache(ctx, review.ProductID.String())

	return true, nil
}
