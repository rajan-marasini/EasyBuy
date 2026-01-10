package auth

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
	Create(*models.User) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindByID(id string) (*models.User, error)
	UpdateLoginTime(id string) error
	VerifyEmailToken(token, email string) (*models.User, error)
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, rdb *redis.Client) Repository {
	return &repository{db, rdb}
}

func (r *repository) Create(user *models.User) (*models.User, error) {
	if err := r.db.Model(&models.User{}).Create(&user).Error; err != nil {
		return nil, err
	}

	userBytes, err := json.Marshal(user)
	if err == nil {
		ctx := context.Background()
		r.redis.Set(ctx, fmt.Sprintf("user:email:%s", user.Email), userBytes, time.Hour)
		r.redis.Set(ctx, fmt.Sprintf("user:id:%s", user.ID), userBytes, time.Hour)

		// Invalidate paginated user list cache
		iter := r.redis.Scan(ctx, 0, "users:page:*", 0).Iterator()
		for iter.Next(ctx) {
			r.redis.Del(ctx, iter.Val())
		}
	}

	return user, nil
}

func (r *repository) FindByEmail(email string) (*models.User, error) {
	cacheKey := fmt.Sprintf("user:email:%s", email)
	ctx := context.Background()

	var user models.User
	val, err := r.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(val), &user); err == nil {
			log.Println("Cache hit for", cacheKey)
			return &user, nil
		}
	}

	if err := r.db.Model(&models.User{}).Where("email=?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	if userBytes, err := json.Marshal(&user); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(ctx, cacheKey, userBytes, time.Hour)
		r.redis.Set(ctx, fmt.Sprintf("user:id:%s", user.ID), userBytes, time.Hour)
	}

	return &user, nil
}

func (r *repository) UpdateLoginTime(id string) error {
	if err := r.db.Model(&models.User{}).Where("id=?", id).Update("last_login_at", time.Now()).Error; err != nil {
		return err
	}

	ctx := context.Background()
	r.redis.Del(ctx, fmt.Sprintf("user:id:%s", id))

	return nil
}

func (r *repository) FindByID(id string) (*models.User, error) {
	cacheKey := fmt.Sprintf("user:id:%s", id)
	ctx := context.Background()

	var user models.User
	val, err := r.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(val), &user); err == nil {
			log.Println("Cache hit for", cacheKey)
			return &user, nil
		}
	}

	if err := r.db.Model(&models.User{}).Where("id=?", id).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	if userBytes, err := json.Marshal(&user); err == nil {
		log.Println("Cache miss for", cacheKey)
		r.redis.Set(ctx, cacheKey, userBytes, time.Hour)
		r.redis.Set(ctx, fmt.Sprintf("user:email:%s", user.Email), userBytes, time.Hour)
	}

	return &user, nil
}

func (r *repository) VerifyEmailToken(token, email string) (*models.User, error) {
	user, err := r.FindByEmail(email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("user not found")
	}

	log.Println("Email verification token for", email, "is", user.EmailVerificationToken)
	log.Println("Provided token is", token)

	if user.EmailVerificationToken == "" || user.EmailVerificationToken != token {
		return nil, fmt.Errorf("invalid verification token")
	}

	if err := r.db.Model(&models.User{}).Where("id=?", user.ID).Updates(map[string]interface{}{
		"is_verified":              true,
		"email_verified_at":        time.Now(),
		"email_verification_token": "",
	}).Error; err != nil {
		return nil, err
	}

	// Invalidate cache
	ctx := context.Background()
	r.redis.Del(ctx, fmt.Sprintf("user:id:%s", user.ID))
	r.redis.Del(ctx, fmt.Sprintf("user:email:%s", user.Email))

	return user, nil
}
