package user

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
	GetAll(ctx context.Context, page, limit int) ([]models.User, int64, error)
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	Create(ctx context.Context, user *models.User) (*models.User, error)
	Update(ctx context.Context, user *models.User) (*models.User, error)
	Delete(ctx context.Context, id string) error
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, redis *redis.Client) Repository {
	return &repository{db, redis}
}

type userCache struct {
	Users []models.User `json:"users"`
	Total int64         `json:"total"`
}

func (r *repository) GetAll(ctx context.Context, page, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	offset := (page - 1) * limit
	cacheKey := fmt.Sprintf("users:page:%d:limit:%d", page, limit)

	if val, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
		var cache userCache
		if err := json.Unmarshal([]byte(val), &cache); err == nil {
			log.Println("Cache hit for", cacheKey)
			return cache.Users, cache.Total, nil
		}
	}

	if err := r.db.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.WithContext(ctx).
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&users).Error; err != nil {
		return nil, 0, err
	}

	cacheData := userCache{
		Users: users,
		Total: total,
	}
	if bytes, err := json.Marshal(cacheData); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(ctx, cacheKey, bytes, time.Hour)
	}

	return users, total, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*models.User, error) {
	cacheKey := fmt.Sprintf("user:id:%s", id)

	if val, err := r.redis.Get(ctx, cacheKey).Result(); err == nil {
		var user models.User
		if err := json.Unmarshal([]byte(val), &user); err == nil {
			log.Println("Cache hit:", cacheKey)
			return &user, nil
		}
	}

	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}

	if b, err := json.Marshal(user); err == nil {
		log.Println("Cache miss:", cacheKey)
		r.redis.Set(ctx, cacheKey, b, time.Hour)
	}

	return &user, nil
}

func (r *repository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *repository) Create(ctx context.Context, user *models.User) (*models.User, error) {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, err
	}
	r.invalidateCache(ctx)
	return user, nil
}

func (r *repository) Update(ctx context.Context, user *models.User) (*models.User, error) {
	if err := r.db.WithContext(ctx).Save(user).Error; err != nil {
		return nil, err
	}
	r.redis.Del(ctx, fmt.Sprintf("user:id:%s", user.ID))
	r.invalidateCache(ctx)
	return user, nil
}

func (r *repository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id).Error; err != nil {
		return err
	}
	r.invalidateCache(ctx)
	return nil
}

func (r *repository) invalidateCache(ctx context.Context) {
	iter := r.redis.Scan(ctx, 0, "users:page:*", 0).Iterator()
	for iter.Next(ctx) {
		r.redis.Del(ctx, iter.Val())
	}
}
