package app

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"gorm.io/gorm"
)

type AppWrapper struct {
	*fiber.App
	Config *config.Config
	DB     *gorm.DB
}

func NewFiberApp(cfg *config.Config, db *gorm.DB) *AppWrapper {
	app := fiber.New(fiber.Config{
		ErrorHandler: errorHandler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	})

	registerMiddleware(app, cfg)

	return &AppWrapper{
		App:    app,
		Config: cfg,
		DB:     db,
	}
}

func errorHandler(c *fiber.Ctx, err error) error {
	code := http.StatusInternalServerError
	var errorMsg interface{} = err.Error()

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		errorMsg = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": errorMsg,
	})
}
