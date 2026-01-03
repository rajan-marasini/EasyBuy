package auth

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
)

type Handler interface {
	RegisterUser(c *fiber.Ctx) error
	LoginUser(c *fiber.Ctx) error
	LogoutUser(c *fiber.Ctx) error
}

type handler struct {
	serv      Service
	validator *validator.Validate
	cfg       *config.Config
}

func NewHandler(serv Service, cfg *config.Config) Handler {
	return &handler{
		serv:      serv,
		cfg:       cfg,
		validator: validator.New(),
	}
}

func (h *handler) RegisterUser(c *fiber.Ctx) error {

	var req UserRegisterRequest

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(400, err.Error())
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(400, err.Error())
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

func (h *handler) LoginUser(c *fiber.Ctx) error {
	var req UserLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(400, "Bad Request")
	}

	if err := h.validator.Struct(req); err != nil {
		return fiber.NewError(400, "Bad Request")
	}

	res, err := h.serv.LoginUser(req)
	if err != nil {
		return err
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    res.Token,
		HTTPOnly: true,
		Secure:   false,
		SameSite: "lax",
	})

	return c.Status(200).JSON(fiber.Map{
		"success": true,
		"message": "User login successful",
		"data":    res,
	})
}

func (h *handler) LogoutUser(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		HTTPOnly: true,
		Secure:   false,
		SameSite: "lax",
	})

	return c.Status(200).JSON(fiber.Map{
		"success": true,
		"message": "User logged out successfully",
	})
}
