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
	GetProductReviews(ctx context.Context, productId string) ([]models.Review, error)
	Create(ctx context.Context, review models.Review) (*models.Review, error)
	Update(ctx context.Context, review models.Review, reviewId string) (*models.Review, error)
	Delete(ctx context.Context, reviewId string) (bool, error)
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, rdb *redis.Client) Repository {
	return &repository{db, rdb}
}

func (r *repository) GetProductReviews(ctx context.Context, productId string) ([]models.Review, error) {
	cacheKey := fmt.Sprintf("reviews:product:%s", productId)
	var reviews []models.Review

	val, err := r.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(val), &reviews); err == nil {
			log.Println("Cache hit for", cacheKey)
			return reviews, nil
		}
	}

	if err := r.db.WithContext(ctx).Where("product_id = ?", productId).Find(&reviews).Error; err != nil {
		return nil, err
	}

	log.Println("Cache miss for", cacheKey)
	if reviewByte, err := json.Marshal(&reviews); err == nil {
		r.redis.Set(ctx, cacheKey, reviewByte, time.Hour)
	}

	return reviews, nil
}

func (r *repository) Create(ctx context.Context, review models.Review) (*models.Review, error) {
	if err := r.db.WithContext(ctx).Model(&models.Review{}).Create(&review).Error; err != nil {
		return nil, err
	}

	cacheKey := fmt.Sprintf("reviews:product:%s", review.ProductID)
	r.redis.Del(ctx, cacheKey)

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

	cacheKey := fmt.Sprintf("reviews:product:%s", review.ProductID)
	r.redis.Del(ctx, cacheKey)

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

	cacheKey := fmt.Sprintf("reviews:product:%s", review.ProductID)
	r.redis.Del(ctx, cacheKey)

	return true, nil
}
