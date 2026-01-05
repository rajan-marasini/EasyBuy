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
	products := seedProducts(db, adminUser.ID, categories)

	// 7. Seed Reviews
	seedReviews(db, adminUser, products)

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

func seedProducts(db *gorm.DB, userID uuid.UUID, categories []models.Category) []models.Product {
	var count int64
	db.Model(&models.Product{}).Count(&count)
	if count >= 20 {
		log.Println("Products already seeded (at least 20), skipping.")
		var products []models.Product
		db.Limit(20).Find(&products)
		return products
	}

	log.Println("Seeding 20 products...")
	var products []models.Product

	// Detailed product description templates
	descriptionTemplates := []string{
		"Experience premium quality with this exceptional product designed for modern living. Crafted with meticulous attention to detail, this item combines functionality with elegant aesthetics. Features include advanced materials for durability, ergonomic design for comfort, and innovative technology for superior performance. Perfect for both personal and professional use, it seamlessly integrates into your daily routine. The sleek design complements any environment while delivering outstanding results. Backed by rigorous quality testing and manufactured to the highest standards, this product represents excellent value for money. Whether you're a beginner or an expert, you'll appreciate the intuitive interface and versatile capabilities. Includes comprehensive warranty coverage and dedicated customer support. Environmentally conscious production methods ensure sustainability without compromising on quality.",
		"Discover the perfect blend of innovation and reliability with this outstanding product. Engineered using cutting-edge technology and premium materials, it delivers exceptional performance in every aspect. The sophisticated design reflects years of research and development, resulting in a product that exceeds industry standards. Key features include enhanced durability, user-friendly operation, and versatile functionality that adapts to your needs. Ideal for demanding applications, it maintains consistent performance even under challenging conditions. The thoughtful construction ensures longevity, making it a smart investment for the future. Easy to maintain and built to last, this product comes with detailed instructions and helpful tips for optimal use. Experience the difference that quality craftsmanship makes in your everyday life.",
		"Transform your experience with this premium product that sets new standards in its category. Meticulously designed and expertly crafted, it offers unparalleled quality and performance. The innovative features include state-of-the-art components, precision engineering, and attention to every detail. Built to withstand regular use while maintaining its pristine condition, this product is both practical and stylish. The versatile design makes it suitable for various applications, from casual everyday use to professional settings. Advanced manufacturing techniques ensure consistency and reliability, while the elegant finish adds a touch of sophistication. Comprehensive testing guarantees that every unit meets strict quality criteria. Enjoy peace of mind with excellent warranty coverage and responsive customer service ready to assist you.",
		"Elevate your standards with this exceptional product that combines form and function beautifully. Created with the user in mind, every aspect has been optimized for maximum satisfaction. Premium materials ensure durability and longevity, while the sleek design adds aesthetic appeal to any setting. Advanced features provide enhanced capabilities without compromising ease of use. The intuitive interface makes it accessible to users of all skill levels, while powerful performance satisfies even the most demanding requirements. Rigorous quality control processes ensure that each product meets exacting standards. Environmentally responsible manufacturing practices demonstrate commitment to sustainability. Whether for personal enjoyment or professional applications, this product delivers consistent, reliable results that exceed expectations.",
		"Introducing a revolutionary product that redefines excellence in its class. Expertly engineered with premium components and innovative design principles, it offers superior performance and remarkable durability. The comprehensive feature set includes everything you need for optimal functionality, while the elegant aesthetics ensure it looks as good as it performs. Designed for versatility, it adapts seamlessly to various use cases and environments. The robust construction withstands daily wear and tear, maintaining its quality over extended periods. User-centric design philosophy ensures comfortable, efficient operation with minimal learning curve. Backed by extensive research and development, this product represents the pinnacle of quality and innovation. Complete with detailed documentation and excellent after-sales support for your peace of mind.",
	}

	for i := 1; i <= 20; i++ {
		category := categories[rand.Intn(len(categories))]
		// Use one of the detailed description templates
		description := descriptionTemplates[rand.Intn(len(descriptionTemplates))]

		product := models.Product{
			Name:        fmt.Sprintf("Product %d", i),
			Description: description,
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
		} else {
			products = append(products, product)
		}
	}
	log.Println("Products seeded successfully")
	return products
}

// seedReviews creates realistic reviews for products with concise descriptions
func seedReviews(db *gorm.DB, adminUser *models.User, products []models.Product) {
	var count int64
	db.Model(&models.Review{}).Count(&count)
	if count > 0 {
		log.Println("Reviews already seeded, skipping.")
		return
	}

	log.Println("Seeding reviews...")

	// Concise review templates for different ratings
	reviewTemplates := map[int][]string{
		5: {
			"Excellent product! Exceeded my expectations. Quality is top-notch and works perfectly. Highly recommend!",
			"Best purchase I've made this year! Great quality, fast shipping, and exactly as described. Five stars!",
			"Amazing! The build quality is fantastic and it does exactly what I need. Worth every penny.",
			"Perfect! No complaints at all. Great value for money and the seller was very responsive.",
			"Outstanding product! Very satisfied with this purchase. Will definitely buy from this seller again.",
		},
		4: {
			"Really good product overall. Minor issues with setup but works great once configured. Recommended!",
			"Very satisfied! Good quality and performs well. Only wish it came in more color options.",
			"Solid product that delivers on its promises. Good value for the price. Would buy again.",
			"Great purchase! Works as expected. Slightly larger than anticipated but still very happy with it.",
		},
		3: {
			"It's okay, does the job but nothing special. Average quality for the price.",
			"Mixed feelings. Works fine but build quality could be better. Acceptable for basic use.",
			"Decent product but has some drawbacks. Gets the job done but there are better options out there.",
		},
		2: {
			"Disappointed. Quality is subpar and doesn't match the description. Expected better for this price.",
			"Not great. Product feels cheap and I've had several issues already. Wouldn't recommend.",
		},
		1: {
			"Terrible product! Broke within days. Complete waste of money. Do not buy!",
			"Very unsatisfied. Poor quality and nothing works as advertised. Returning this immediately.",
		},
	}

	// Create reviews for random products
	reviewCount := 0
	for i := 0; i < len(products) && reviewCount < 50; i++ {
		// Each product gets 1-4 reviews
		numReviews := rand.Intn(4) + 1

		for j := 0; j < numReviews; j++ {
			// Weighted random rating (more likely to be 4-5 stars)
			rating := getWeightedRating()

			// Get random comment from templates
			comments := reviewTemplates[rating]
			comment := comments[rand.Intn(len(comments))]

			review := models.Review{
				ProductID: products[i].ID,
				UserID:    adminUser.ID,
				Rating:    rating,
				Comment:   comment,
			}

			if err := db.Create(&review).Error; err != nil {
				log.Printf("Failed to create review for product %s: %v\n", products[i].Name, err)
			} else {
				reviewCount++
				log.Printf("Created %d-star review for product: %s\n", rating, products[i].Name)
			}
		}
	}

	log.Printf("Successfully seeded %d reviews\n", reviewCount)
}

// getWeightedRating returns a rating with realistic distribution
// Most products have 4-5 star reviews, fewer have lower ratings
func getWeightedRating() int {
	r := rand.Intn(100)
	switch {
	case r < 45: // 45% chance of 5 stars
		return 5
	case r < 75: // 30% chance of 4 stars
		return 4
	case r < 90: // 15% chance of 3 stars
		return 3
	case r < 97: // 7% chance of 2 stars
		return 2
	default: // 3% chance of 1 star
		return 1
	}
}
