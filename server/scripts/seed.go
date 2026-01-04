package main

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/database"
	"github.com/rajan-marasini/EasyBuy/server/internal/models"
	"github.com/rajan-marasini/EasyBuy/server/internal/utils"
	"gorm.io/gorm"
)

func main() {
	// 1. Load Config
	cfg := config.Load()

	// 2. Connect to Database
	db := database.Connect(cfg)

	// 3. Seed User
	adminUser := seedUser(db)

	// 4. Seed Products
	seedProducts(db, adminUser.ID)

	log.Println("Seeding completed successfully")
}

func seedUser(db *gorm.DB) *models.User {
	var user models.User
	email := "admin@gmail.com"

	// Check if user exists
	if err := db.Where("email = ?", email).First(&user).Error; err == nil {
		log.Printf("User with email %s already exists, skipping creation.\n", email)
		return &user
	}

	hashedPassword, err := utils.HashPassword("admin123")
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	now := time.Now()
	user = models.User{
		Name:            "Admin",
		Email:           email,
		Password:        hashedPassword,
		Role:            "admin",
		IsVerified:      true,
		EmailVerifiedAt: &now,
		Status:          "active",
	}

	if err := db.Create(&user).Error; err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	log.Println("Admin user created successfully")
	return &user
}

func seedProducts(db *gorm.DB, userID uuid.UUID) {
	var count int64
	db.Model(&models.Product{}).Count(&count)
	if count >= 10 {
		log.Println("Products already seeded, skipping.")
		return
	}

	log.Println("Seeding 10 products...")
	for i := 1; i <= 10; i++ {
		product := models.Product{
			Name:        fmt.Sprintf("Product %d", i),
			Description: fmt.Sprintf("Description for Product %d", i),
			Price:       float64(rand.Intn(100000)) / 100.0, // Random price between 0.00 and 1000.00
			Stock:       rand.Intn(100),
			ImageURL:    fmt.Sprintf("https://picsum.photos/seed/%d/200/300", i),
			IsActive:    true,
			UserID:      userID,
			Brand:       "",
		}

		if err := db.Create(&product).Error; err != nil {
			log.Printf("Failed to create product %d: %v\n", i, err)
		}
	}
	log.Println("Products seeded successfully")
}
