package main

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
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

	// 3. Migrate Database
	database.Migrate(db)

	// 4. Seed User
	adminUser := seedUser(db)

	// 5. Seed Categories
	categories := seedCategories(db)

	// 6. Seed Products
	seedProducts(db, adminUser.ID, categories)

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

func seedCategories(db *gorm.DB) []models.Category {
	categoryNames := []string{"Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty"}
	var categories []models.Category

	for _, name := range categoryNames {
		var category models.Category
		if err := db.Where("name = ?", name).First(&category).Error; err != nil {
			category = models.Category{
				Name: name,
			}
			if err := db.Create(&category).Error; err != nil {
				log.Printf("Failed to create category %s: %v\n", name, err)
			} else {
				log.Printf("Category %s created successfully\n", name)
			}
		} else {
			log.Printf("Category %s already exists, skipping.\n", name)
		}
		categories = append(categories, category)
	}

	return categories
}

func seedProducts(db *gorm.DB, userID uuid.UUID, categories []models.Category) {
	var count int64
	db.Model(&models.Product{}).Count(&count)
	if count >= 20 {
		log.Println("Products already seeded (at least 20), skipping.")
		return
	}

	log.Println("Seeding 20 products...")
	for i := 1; i <= 20; i++ {
		category := categories[rand.Intn(len(categories))]
		product := models.Product{
			Name:        fmt.Sprintf("Product %d", i),
			Description: fmt.Sprintf("Description for Product %d belonging to %s category", i, category.Name),
			Price:       float64(rand.Intn(100000)) / 100.0,
			Stock:       rand.Intn(100),
			Images: pq.StringArray{
				fmt.Sprintf("https://picsum.photos/seed/%d/200/300", i),
				fmt.Sprintf("https://picsum.photos/seed/%d/200/300", i+1),
				"https://placehold.co/600x400",
			},
			IsActive:   true,
			UserID:     userID,
			CategoryID: category.ID,
			Brand:      fmt.Sprintf("Brand %c", rune('A'+rand.Intn(26))),
		}

		if err := db.Create(&product).Error; err != nil {
			log.Printf("Failed to create product %d: %v\n", i, err)
		}
	}
	log.Println("Products seeded successfully")
}
