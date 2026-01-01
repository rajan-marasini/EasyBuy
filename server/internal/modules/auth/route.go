package auth

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"gorm.io/gorm"
)

func RegisterAuthRoute(router fiber.Router, cfg *config.Config, db *gorm.DB) {
	router.Get("/", func(c *fiber.Ctx) error {
		return c.JSON("auth route working fine")
	})
}
