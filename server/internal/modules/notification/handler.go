package notification

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type Handler interface {
	GetNotification(c *fiber.Ctx) error
	UpdateNotification(c *fiber.Ctx) error
}

type handler struct {
	serv NotificationService
}

func NewHandler(serv NotificationService) Handler {
	return &handler{serv}
}

func (h *handler) GetNotification(c *fiber.Ctx) error {
	user := c.Locals("user")
	if user == nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Details not found")
	}

	claims, ok := user.(jwt.MapClaims)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "Details not found")
	}

	userID, ok := claims["id"].(string)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "Details not found")
	}

	notifications, err := h.serv.GetUserNotifications(c.Context(), userID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Notifications fetched successfully",
		"data":    notifications,
	})
}

func (h *handler) UpdateNotification(c *fiber.Ctx) error {
	userFunc := c.Locals("user")
	if userFunc == nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Unauthorized access")
	}

	claims, ok := userFunc.(jwt.MapClaims)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "Unauthorized access")
	}

	userID, ok := claims["id"].(string)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "Unauthorized access")
	}

	notificationID := c.Params("id")
	if notificationID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Notification Id is required")
	}

	data, err := h.serv.UpdateNotification(c.Context(), notificationID, userID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Notification marked as read successfully",
		"data":    data,
	})

}
