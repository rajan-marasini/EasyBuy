package product

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

type Handler interface {
	GetAllProducts(c *fiber.Ctx) error
}

type handler struct {
	serv Service
}

func NewHandler(serv Service) Handler {
	return &handler{serv}
}

func (h *handler) GetAllProducts(c *fiber.Ctx) error {
	res, err := h.serv.GetAllProducts()
	if err != nil {
		return fiber.NewError(500, err.Error())
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "products fetched successfully",
		"data":    res,
	})
}
