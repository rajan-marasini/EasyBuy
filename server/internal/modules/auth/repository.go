package auth

import (
	"time"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"gorm.io/gorm"
)

type Repository interface {
	Create(UserRegisterRequest) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	UpdateLoginTime(id string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db}
}

func (r *repository) Create(req UserRegisterRequest) (*models.User, error) {
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	if err := r.db.Create(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *repository) FindByEmail(email string) (*models.User, error) {
	var user models.User

	if err := r.db.Where("email=?", email).First(&user).Error; err != nil {
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
