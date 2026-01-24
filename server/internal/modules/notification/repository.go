package notification

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
	Create(ctx context.Context, notification *models.Notification) error
	GetUserNotifications(ctx context.Context, userID string) ([]models.Notification, error)
	UpdateNotification(ctx context.Context, notificationID string, userID string) (*models.Notification, error)
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, rds *redis.Client) Repository {
	return &repository{db, rds}
}

func (r *repository) Create(ctx context.Context, notification *models.Notification) error {
	if err := r.db.WithContext(ctx).Model(models.Notification{}).Create(notification).Error; err != nil {
		return err
	}
	cacheKey := fmt.Sprintf("user:%s:notification", notification.UserID)
	r.redis.Del(ctx, cacheKey)
	return nil
}

func (r *repository) GetUserNotifications(ctx context.Context, userID string) ([]models.Notification, error) {
	cacheKey := fmt.Sprintf("user:%s:notification", userID)

	notifications := []models.Notification{}

	val, err := r.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(val), &notifications); err == nil {
			log.Println("Cache hit for ", cacheKey)
			return notifications, err
		}
	}
	if err := r.db.WithContext(ctx).
		Model(models.Notification{}).
		Where("user_id", userID).
		Order("created_at DESC").
		Find(&notifications).Error; err != nil {
		return nil, err
	}

	notificationByte, err := json.Marshal(notifications)
	if err == nil {
		r.redis.Set(ctx, cacheKey, notificationByte, time.Hour)
	}

	return notifications, nil
}

func (r *repository) UpdateNotification(ctx context.Context, notificationID string, userID string) (*models.Notification, error) {
	var notification models.Notification
	result := r.db.WithContext(ctx).
		Model(&notification).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("is_read", true)

	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
		return nil, fmt.Errorf("notification not found or unauthorized")
	}

	if err := r.db.
		WithContext(ctx).
		First(&notification, "id = ?", notificationID).
		Error; err != nil {
		return nil, err
	}

	cacheKey := fmt.Sprintf("user:%s:notification", userID)
	r.redis.Del(ctx, cacheKey)

	return &notification, nil
}
