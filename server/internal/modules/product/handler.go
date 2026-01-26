package product

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/utils"
)

type Handler interface {
	GetAllProducts(c *fiber.Ctx) error
	GetProductById(c *fiber.Ctx) error
	CreateProduct(c *fiber.Ctx) error
	UpdateProduct(c *fiber.Ctx) error
	DeleteProduct(c *fiber.Ctx) error
}

type handler struct {
	serv      Service
	validator *validator.Validate
	cfg       *config.Config
}

func NewHandler(serv Service, cfg *config.Config) Handler {
	return &handler{serv, validator.New(), cfg}
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

	var req CreateProductRequest

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, "Invalid request body")
	}

	// Handle file uploads
	form, _ := c.MultipartForm()
	if form != nil && form.File["images"] != nil {
		images, err := utils.UploadToCloudinary(c.Context(), form.File["images"], h.cfg, "products")
		if err != nil {
			return fiber.NewError(http.StatusInternalServerError, err.Error())
		}
		req.Images = images
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
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

func (h *handler) UpdateProduct(c *fiber.Ctx) error {
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

	id := c.Params("productID", "")
	if id == "" {
		return fiber.NewError(400, "product id is required")
	}

	var req UpdateProductRequest

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	// Handle file uploads
	form, _ := c.MultipartForm()
	if form != nil && form.File["images"] != nil {
		images, err := utils.UploadToCloudinary(c.Context(), form.File["images"], h.cfg, "products")
		if err != nil {
			return fiber.NewError(http.StatusInternalServerError, err.Error())
		}
		req.Images = images
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	product, err := h.serv.UpdateProduct(c.Context(), id, req, userID)
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "product updated successfully",
		"data":    product,
	})
}

func (h *handler) DeleteProduct(c *fiber.Ctx) error {
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

	id := c.Params("productID", "")
	if id == "" {
		return fiber.NewError(400, "product id is required")
	}

	if err := h.serv.DeleteProduct(c.Context(), id, userID); err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "product deleted successfully",
	})
}
