package order

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
)

type Handler interface {
	CreateOrder(c *fiber.Ctx) error
	GetAllOrders(c *fiber.Ctx) error
	GetUserOrders(c *fiber.Ctx) error
	UpdateStatus(c *fiber.Ctx) error
}

type handler struct {
	serv      Service
	validator *validator.Validate
	cfg       *config.Config
}

func NewHandler(serv Service, cfg *config.Config) Handler {
	return &handler{serv, validator.New(), cfg}
}

func (h *handler) CreateOrder(c *fiber.Ctx) error {
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

	var req CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, "Invalid request body")
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	order, err := h.serv.CreateOrder(c.Context(), userID, req)
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	resp := toOrderResponse(order)
	for _, item := range order.OrderItems {
		resp.Items = append(resp.Items, toOrderItemResponse(&item))
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Order created successfully",
		"data":    resp,
	})
}

func (h *handler) GetAllOrders(c *fiber.Ctx) error {
	// Parse pagination parameters
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	// Validate and cap limits
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	// Calculate offset
	offset := (page - 1) * limit

	orders, total, err := h.serv.GetAllOrders(c.Context(), limit, offset)
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	// Convert to lightweight DTOs
	orderResponses := make([]OrderListItemResponse, 0, len(orders))
	for _, order := range orders {
		orderResponses = append(orderResponses, toOrderListItemResponse(&order))
	}

	// Calculate total pages
	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	// Build paginated response
	response := PaginatedOrdersResponse{
		Orders: orderResponses,
		Pagination: PaginationMetadata{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Orders retrieved successfully",
		"data":    response,
	})
}

func (h *handler) GetUserOrders(c *fiber.Ctx) error {
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

	// Parse pagination parameters
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	// Validate and cap limits
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	// Calculate offset
	offset := (page - 1) * limit

	orders, total, err := h.serv.GetUserOrders(c.Context(), userID, limit, offset)
	if err != nil {
		return fiber.NewError(http.StatusInternalServerError, err.Error())
	}

	// Convert to lightweight DTOs
	orderResponses := make([]OrderListItemResponse, 0, len(orders))
	for _, order := range orders {
		orderResponses = append(orderResponses, toOrderListItemResponse(&order))
	}

	// Calculate total pages
	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	// Build paginated response
	response := PaginatedOrdersResponse{
		Orders: orderResponses,
		Pagination: PaginationMetadata{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Orders retrieved successfully",
		"data":    response,
	})
}

func (h *handler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		OrderStatus    string `json:"order_status"`
		DeliveryStatus string `json:"delivery_status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(http.StatusBadRequest, "Invalid request body")
	}

	if req.OrderStatus != "" {
		if err := h.serv.UpdateOrderStatus(c.Context(), id, req.OrderStatus); err != nil {
			return fiber.NewError(http.StatusInternalServerError, err.Error())
		}
	}

	if req.DeliveryStatus != "" {
		if err := h.serv.UpdateDeliveryStatus(c.Context(), id, req.DeliveryStatus); err != nil {
			return fiber.NewError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Order status updated successfully",
	})
}
