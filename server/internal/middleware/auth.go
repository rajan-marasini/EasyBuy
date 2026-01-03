package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/utils"
)

func IsAuthenticated(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tokenString string

		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}

		if tokenString == "" {
			tokenString = c.Cookies("token")
		}

		if tokenString == "" {
			return fiber.NewError(400, "Token missing")
		}

		claims, err := utils.VerifyToken(tokenString, cfg.JWT_SECRET)
		if err != nil {
			return fiber.NewError(400, "Invalid or expired token")
		}

		c.Locals("user", claims)

		return c.Next()
	}
}
