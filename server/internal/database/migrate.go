package database

import (
	"log"

	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) {
	log.Println("Starting migration ....")

	err := db.AutoMigrate(
		&models.User{},
		&models.Product{},
	)

	if err != nil {
		log.Println("[Error]:", err.Error())
	}

	log.Println("Migration applied successfully")
}
