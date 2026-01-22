package notification

import (
	"context"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, notification *models.Notification) error
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
	return nil
}
