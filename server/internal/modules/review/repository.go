package review

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Repository interface {
	GetProductReviews(ctx context.Context, productId string) ([]models.Review, error)
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

	if err := r.db.WithContext(ctx).Model(&models.Review{}).Find(&reviews, "product_id = ?", productId).Error; err != nil {
		return nil, err
	}

	if reviewByte, err := json.Marshal(&reviews); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(ctx, cacheKey, reviewByte, time.Hour)
	}

	return reviews, nil
}
