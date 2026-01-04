package product

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type Handler interface {
	GetAllProducts(c *fiber.Ctx) error
	GetProductById(c *fiber.Ctx) error
	CreateProduct(c *fiber.Ctx) error
}

type handler struct {
	serv      Service
	validator *validator.Validate
}

func NewHandler(serv Service) Handler {
	return &handler{serv, validator.New()}
}

func (h *handler) GetAllProducts(c *fiber.Ctx) error {
	var req PaginationRequest
	if err := c.QueryParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, "Invalid pagination parameters")
	}

	if req.Page < 1 {
		req.Page = 1
	}
	if req.Limit < 1 {
		req.Limit = 10
	}

	res, err := h.serv.GetAllProducts(c.Context(), req)
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "products fetched successfully",
		"data":    res.Data,
		"meta":    res.Meta,
	})
}

func (h *handler) GetProductById(c *fiber.Ctx) error {

	id := c.Params("productID", "")
	if id == "" {
		return fiber.NewError(400, "product id is required")
	}

	product, err := h.serv.GetProductById(c.Context(), id)
	if err != nil {
		return fiber.NewError(404, err.Error())
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    product,
	})
}

func (h *handler) CreateProduct(c *fiber.Ctx) error {
	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, "Invalid request body")
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	userFunc := c.Locals("user")
	if userFunc == nil {
		return fiber.NewError(http.StatusUnauthorized, "Details not found")
	}

	claims, ok := userFunc.(jwt.MapClaims)
	if !ok {
		return fiber.NewError(http.StatusInternalServerError, "Invalid token claims")
	}

	userID, ok := claims["id"].(string)
	if !ok {
		return fiber.NewError(http.StatusInternalServerError, "Details not found")
	}

	product, err := h.serv.CreateProduct(c.Context(), req, userID)
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "product created successfully",
		"data":    product,
	})
}
