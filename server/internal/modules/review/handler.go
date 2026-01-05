package review

import "github.com/gofiber/fiber/v2"

type Handler interface {
	GetProductReviews(c *fiber.Ctx) error
	CreateReview(c *fiber.Ctx) error
	UpdateReview(c *fiber.Ctx) error
	DeleteReview(c *fiber.Ctx) error
}

type handler struct {
	serv Service
}

func NewHandler(serv Service) Handler {
	return &handler{serv}
}

func (h *handler) GetProductReviews(c *fiber.Ctx) error {
	return c.Status(200).JSON("getting product review")
}

func (h *handler) CreateReview(c *fiber.Ctx) error {
	return nil
}

func (h *handler) UpdateReview(c *fiber.Ctx) error {
	return nil
}

func (h *handler) DeleteReview(c *fiber.Ctx) error {
	return nil
}
