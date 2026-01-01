package database

import (
	"log"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) {
	log.Println("Starting migration ....")

	err := db.AutoMigrate()

	if err != nil {
		log.Println("[Error]:", err.Error())
	}

	log.Println("Migration applied successfully")
}
