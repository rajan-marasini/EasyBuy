package auth

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/errors"
)

type Handler struct {
	serv *Service
}

func NewHandler(serv *Service) *Handler {
	return &Handler{serv}
}

func (h *Handler) CheckHealth(c *fiber.Ctx) error {
	return c.Status(200).JSON("Auth health fine")
}

func (h *Handler) RegisterUser(c *fiber.Ctx) error {

	var req UserRegisterRequest

	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("Invalid body")
	}

	user, err := h.serv.RegisterUser(req)
	if err != nil {
		return err
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "User registered successfully",
		"data":    user,
	})
}
