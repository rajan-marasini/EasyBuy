package product

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Repository interface {
}

type repository struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewRepository(db *gorm.DB, rds *redis.Client) Repository {
	return &repository{db, rds}
}
