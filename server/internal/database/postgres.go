package database

import (
	"log"

	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(postgres.Open(cfg.DATABASE_URL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("[Error]:", err.Error())
	}

	log.Println("Database connected successfully")
	return db
}
