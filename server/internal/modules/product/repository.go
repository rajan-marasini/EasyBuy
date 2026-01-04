package product

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
	GetAllProducts(ctx context.Context, page, limit int) ([]models.Product, int64, error)
	GetByID(ctx context.Context, id string) (*models.Product, error)
	Create(ctx context.Context, product *models.Product) (*models.Product, error)
	Update(ctx context.Context, product *models.Product) (*models.Product, error)
	Delete(ctx context.Context, id string) (*models.Product, error)
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, redis *redis.Client) Repository {
	return &repository{db, redis}
}

type productCache struct {
	Products []models.Product `json:"products"`
	Total    int64            `json:"total"`
}

func (r *repository) GetAllProducts(ctx context.Context, page, limit int) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	offset := (page - 1) * limit
	cacheKey := fmt.Sprintf("products:page:%d:limit:%d", page, limit)

	if val, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
		var cache productCache
		if err := json.Unmarshal([]byte(val), &cache); err == nil {
			log.Println("Cache hit for", cacheKey)
			return cache.Products, cache.Total, nil
		}
	}

	if err := r.db.Model(&models.Product{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.
		WithContext(ctx).
		Model(&models.Product{}).
		Preload("Category").
		Limit(limit).
		Offset(offset).
		Find(&products).Error; err != nil {
		return nil, 0, err
	}

	cacheData := productCache{
		Products: products,
		Total:    total,
	}
	if bytes, err := json.Marshal(cacheData); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(ctx, cacheKey, bytes, time.Hour)
	}

	return products, total, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*models.Product, error) {
	cacheKey := fmt.Sprintf("product:id:%s", id)

	if val, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
		var product models.Product
		if err := json.Unmarshal([]byte(val), &product); err == nil {
			log.Println("Cache hit:", cacheKey)
			return &product, nil
		}
	}

	var product models.Product
	err := r.db.WithContext(ctx).
		Preload("Category").
		First(&product, "id = ?", id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}

	if b, err := json.Marshal(product); err == nil {
		log.Println("Cache miss:", cacheKey)
		r.redis.Set(ctx, cacheKey, b, time.Hour)
	}

	return &product, nil
}

func (r *repository) Create(ctx context.Context, product *models.Product) (*models.Product, error) {
	if err := r.db.WithContext(ctx).Model(&models.Product{}).Create(product).Error; err != nil {
		return nil, err
	}

	if productByte, err := json.Marshal(product); err == nil {
		cacheKey := fmt.Sprintf("product:id:%s", product.ID)
		r.redis.Set(ctx, cacheKey, &productByte, time.Hour)
	}

	r.invalidateCache(ctx)

	return product, nil
}

func (r *repository) Update(ctx context.Context, product *models.Product) (*models.Product, error) {
	if err := r.db.
		WithContext(ctx).
		Model(&models.Product{}).
		Where("id=?", product.ID).
		Updates(&product).
		Error; err != nil {
		return nil, err
	}

	if productByte, err := json.Marshal(product); err == nil {
		cacheKey := fmt.Sprintf("product:id:%s", product.ID)
		r.redis.Set(ctx, cacheKey, &productByte, time.Hour)
	}

	r.invalidateCache(ctx)

	return product, nil
}

func (r *repository) Delete(ctx context.Context, id string) (*models.Product, error) {
	var product models.Product
	if err := r.db.WithContext(ctx).First(&product, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("product not found")
		}
		return nil, err
	}

	if err := r.db.WithContext(ctx).Delete(&product).Error; err != nil {
		return nil, err
	}

	cacheKey := fmt.Sprintf("product:id:%s", id)
	r.redis.Del(ctx, cacheKey)

	return &product, nil
}

func (r *repository) invalidateCache(ctx context.Context) {
	// Invalidate paginated product list cache
	iter := r.redis.Scan(ctx, 0, "products:page:*", 0).Iterator()
	for iter.Next(ctx) {
		r.redis.Del(ctx, iter.Val())
	}
}
