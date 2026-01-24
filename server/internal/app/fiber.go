package app

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification"
	"github.com/rajan-marasini/EasyBuy/server/internal/queue"
	"github.com/rajan-marasini/EasyBuy/server/internal/ws"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type AppWrapper struct {
	*fiber.App
	Config       *config.Config
	DB           *gorm.DB
	Redis        *redis.Client
	RabbitMQ     *queue.RabbitMQ
	Notification notification.NotificationService
	WSManager    *ws.WSManager
}

func NewFiberApp(
	cfg *config.Config,
	db *gorm.DB,
	rdb *redis.Client,
	rabbit *queue.RabbitMQ,
	notify notification.NotificationService,
	wsManager *ws.WSManager,
) *AppWrapper {

	app := fiber.New(fiber.Config{
		ErrorHandler: errorHandler,
	})

	registerMiddleware(app, cfg)

	return &AppWrapper{
		App:          app,
		Config:       cfg,
		DB:           db,
		Redis:        rdb,
		RabbitMQ:     rabbit,
		Notification: notify,
		WSManager:    wsManager,
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
