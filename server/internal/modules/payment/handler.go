package payment

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler interface {
	VerifyEsewa(c *fiber.Ctx) error
}

type handler struct {
	serv      Service
	validator *validator.Validate
}

func NewHandler(serv Service) Handler {
	return &handler{
		serv:      serv,
		validator: validator.New(),
	}
}

func (h *handler) VerifyEsewa(c *fiber.Ctx) error {
	var req VerifyEsewaRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	success, err := h.serv.VerifyEsewa(c.Context(), req)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to verify payment")
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": success,
		"message": "payment verification check completed",
	})
}
