package review

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type Handler interface {
	GetProductReviews(c *fiber.Ctx) error
	CreateReview(c *fiber.Ctx) error
	UpdateReview(c *fiber.Ctx) error
	DeleteReview(c *fiber.Ctx) error
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

func (h *handler) GetProductReviews(c *fiber.Ctx) error {
	productId := c.Params("productId", "")
	if productId == "" {
		return fiber.NewError(400, "invalid product id")
	}

	res, err := h.serv.GetProductReviews(c.Context(), productId)
	if err != nil {
		return fiber.NewError(404, "Invalid product id")
	}

	return c.Status(200).JSON(fiber.Map{
		"data": res,
	})
}

func (h *handler) CreateReview(c *fiber.Ctx) error {
	userFunc := c.Locals("user")
	if userFunc == nil {
		return fiber.NewError(http.StatusUnauthorized, "User details not found")
	}

	claims, ok := userFunc.(jwt.MapClaims)
	if !ok {
		return fiber.NewError(http.StatusInternalServerError, "Invalid token claims")
	}

	userID, ok := claims["id"].(string)
	if !ok {
		return fiber.NewError(http.StatusUnauthorized, "User details not found")
	}

	var req CreateReviewRequest

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, "Invalid request body")
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	res, err := h.serv.CreateReview(c.Context(), req, userID)
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, "Failed to create review")
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Product reviewed successfully",
		"data":    res,
	})
}

func (h *handler) UpdateReview(c *fiber.Ctx) error {
	userFunc := c.Locals("user")
	if userFunc == nil {
		return fiber.NewError(http.StatusUnauthorized, "User details not found")
	}
	_, ok := userFunc.(jwt.Claims)
	if !ok {
		return fiber.NewError(http.StatusUnauthorized, "User details not found")
	}

	reviewID := c.Params("reviewId", "")
	if reviewID == "" {
		return fiber.NewError(http.StatusBadRequest, "Review Id is required")
	}

	var req UpdateReviewRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	res, err := h.serv.UpdateReview(c.Context(), req, reviewID)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{
		"success": true,
		"message": "Review updated successfully",
		"data":    res,
	})
}

func (h *handler) DeleteReview(c *fiber.Ctx) error {
	return nil
}
