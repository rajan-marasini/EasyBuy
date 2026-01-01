package auth

import "github.com/gofiber/fiber/v2"

type Controller struct {
	serv *Service
}

func NewController(serv *Service) *Controller {
	return &Controller{serv}
}

func (h *Controller) CheckHealth(c *fiber.Ctx) error {
	return c.Status(200).JSON("Auth health fine")
}
