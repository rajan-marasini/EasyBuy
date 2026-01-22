package notification

import "github.com/gofiber/fiber/v2"

type Handler interface {
	GetNotification(c *fiber.Ctx) error
}

type handler struct {
	serv NotificationService
}

func NewHandler(serv NotificationService) Handler {
	return &handler{serv}
}

func (h *handler) GetNotification(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Notifications fetched successfully",
		"data":    []interface{}{},
	})
}
