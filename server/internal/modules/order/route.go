package order

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
)

func RegisterOrderRoute(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	serv := NewService(repo)
	handler := NewHandler(serv, app.Config)

	router.Post("/", middleware.IsAuthenticated(app.Config), handler.CreateOrder)
}
