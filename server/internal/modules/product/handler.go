package product

import "github.com/gofiber/fiber/v2"

type Handler interface {
	CheckHealth(c *fiber.Ctx) error
}

type handler struct {
	serv Service
}

func NewHandler(serv Service) Handler {
	return &handler{serv}
}

func (h *handler) CheckHealth(c *fiber.Ctx) error {
	return c.Status(200).JSON("product route")
}
