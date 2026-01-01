package database

import (
	"fmt"
	"log"

	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s", cfg.DATABASE_HOST, cfg.DATABASE_USER, cfg.DATABASE_PASSWORD, cfg.DATABASE_NAME, cfg.DATABASE_PORT, cfg.DATABASE_SSLMODE)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("[Error]:", err.Error())
	}

	log.Println("Database connected successfully")
	return db
}
