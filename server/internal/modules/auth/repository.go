package auth

import (
	"gorm.io/gorm"
)

type Repository interface {
	Create(UserRegisterRequest) (*User, error)
	FindByEmail(string) (*User, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db}
}

func (r *repository) Create(req UserRegisterRequest) (*User, error) {
	user := User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	if err := r.db.Create(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *repository) FindByEmail(email string) (*User, error) {
	var user User

	if err := r.db.Where("email=?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err

	}

	return &user, nil
}
