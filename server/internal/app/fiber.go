package app

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
)

type AppWrapper struct {
	*fiber.App
	Config *config.Config
}

func NewFiberApp(cfg *config.Config) *AppWrapper {
	app := fiber.New(fiber.Config{
		ErrorHandler: errorHandler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	})

	return &AppWrapper{
		App:    app,
		Config: cfg,
	}
}

func errorHandler(c *fiber.Ctx, err error) error {
	code := http.StatusInternalServerError

	if er, ok := err.(*fiber.Error); ok {
		code = er.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": err.Error(),
	})
}
