package category

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
	GetAllCategories(ctx context.Context) ([]models.Category, error)
	GetByID(ctx context.Context, id string) (*models.Category, error)
	Create(ctx context.Context, category *models.Category) (*models.Category, error)
	Update(ctx context.Context, category *models.Category) (*models.Category, error)
	Delete(ctx context.Context, id string) (*models.Category, error)
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, rds *redis.Client) Repository {
	return &repository{db, rds}
}

func (r *repository) GetAllCategories(ctx context.Context) ([]models.Category, error) {
	var categories []models.Category

	cacheKey := "categories:all"

	if val, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
		if err := json.Unmarshal([]byte(val), &categories); err == nil {
			log.Println("Cache hit for", cacheKey)
			return categories, nil
		}
	}

	if err := r.db.
		WithContext(ctx).
		Model(&models.Category{}).
		Find(&categories).Error; err != nil {
		return nil, err
	}

	if bytes, err := json.Marshal(categories); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(ctx, cacheKey, bytes, time.Hour)
	}

	return categories, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*models.Category, error) {
	cacheKey := fmt.Sprintf("category:id:%s", id)

	if val, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
		var category models.Category
		if err := json.Unmarshal([]byte(val), &category); err == nil {
			log.Println("Cache hit:", cacheKey)
			return &category, nil
		}
	}

	var category models.Category
	err := r.db.WithContext(ctx).
		Preload("Products").
		First(&category, "id = ?", id).Error

	if err != nil {
		return nil, err
	}

	if b, err := json.Marshal(category); err == nil {
		log.Println("Cache miss:", cacheKey)
		r.redis.Set(ctx, cacheKey, b, time.Hour)
	}

	return &category, nil
}

func (r *repository) Create(ctx context.Context, category *models.Category) (*models.Category, error) {
	if err := r.db.WithContext(ctx).Create(category).Error; err != nil {
		return nil, err
	}

	r.invalidateCache(ctx)
	return category, nil
}

func (r *repository) Update(ctx context.Context, category *models.Category) (*models.Category, error) {
	if err := r.db.WithContext(ctx).Save(category).Error; err != nil {
		return nil, err
	}

	r.invalidateCache(ctx)
	return category, nil
}

func (r *repository) Delete(ctx context.Context, id string) (*models.Category, error) {
	var category models.Category
	if err := r.db.WithContext(ctx).First(&category, "id = ?", id).Error; err != nil {
		return nil, err
	}

	if err := r.db.WithContext(ctx).Delete(&category).Error; err != nil {
		return nil, err
	}

	r.invalidateCache(ctx)
	return &category, nil
}

func (r *repository) invalidateCache(ctx context.Context) {
	r.redis.Del(ctx, "categories:all")
}
