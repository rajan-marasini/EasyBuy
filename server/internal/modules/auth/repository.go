package auth

import (
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

	return user, nil
}

func (r *repository) FindByEmail(email string) (*models.User, error) {
	var user models.User

	if err := r.db.Model(&models.User{}).Where("email=?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (r *repository) UpdateLoginTime(id string) error {
	return r.db.Model(&models.User{}).Where("id=?", id).Update("last_login_at", time.Now()).Error
}

func (r *repository) FindByID(id string) (*models.User, error) {
	var user models.User

	if err := r.db.Model(&models.User{}).Where("id=?", id).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}
