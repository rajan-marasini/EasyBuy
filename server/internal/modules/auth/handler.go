package auth

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/errors"
)

type Handler struct {
	serv      *Service
	validator *validator.Validate
	cfg       *config.Config
}

func NewHandler(serv *Service, cfg *config.Config) *Handler {
	return &Handler{
		serv:      serv,
		cfg:       cfg,
		validator: validator.New(),
	}
}

func (h *Handler) CheckHealth(c *fiber.Ctx) error {
	return c.Status(200).JSON("Auth health fine")
}

func (h *Handler) RegisterUser(c *fiber.Ctx) error {

	var req UserRegisterRequest

	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("Invalid body")
	}

	if err := h.validator.Struct(req); err != nil {
		return errors.BadRequest(err.Error())
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

func (h *Handler) LoginUser(c *fiber.Ctx) error {
	var req UserLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("Invalid body")
	}

	if err := h.validator.Struct(req); err != nil {
		return errors.BadRequest(err.Error())
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
