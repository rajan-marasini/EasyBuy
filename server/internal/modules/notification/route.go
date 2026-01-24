package notification

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
)

func RegisterNotificationRoute(router fiber.Router, config *config.Config, notification NotificationService) {
	handler := NewHandler(notification)

	router.Get("/", middleware.IsAuthenticated(config), handler.GetNotification)
	router.Patch("/:id", middleware.IsAuthenticated(config), handler.UpdateNotification)
}
