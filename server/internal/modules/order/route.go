package order

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
)

func RegisterOrderRoute(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	serv := NewService(repo, app.Config, app.Notification)
	handler := NewHandler(serv, app.Config)

	router.Post("/", middleware.IsAuthenticated(app.Config), handler.CreateOrder)
	router.Get("/", middleware.IsAuthenticated(app.Config), middleware.IsAdmin, handler.GetAllOrders)
	router.Get("/user/:id", middleware.IsAuthenticated(app.Config), handler.GetUserOrders)
}
