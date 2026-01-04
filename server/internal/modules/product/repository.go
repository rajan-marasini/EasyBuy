package product

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Repository interface {
	GetAllProducts() ([]models.Product, error)
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, rds *redis.Client) Repository {
	return &repository{db, rds}
}

func (r *repository) GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	cacheKey := "products:all"

	val, err := r.redis.Get(context.Background(), cacheKey).Result()
	if err == nil {
		if err = json.Unmarshal([]byte(val), &products); err == nil {
			log.Println("Cache hit for", cacheKey)
			return products, nil
		}
	}

	if err := r.db.Model(&models.Product{}).Find(&products).Error; err != nil {
		return nil, err
	}

	if productsByte, err := json.Marshal(&products); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(context.Background(), cacheKey, productsByte, time.Hour)
	}

	return products, nil
}
