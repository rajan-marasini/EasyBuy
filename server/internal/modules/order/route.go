package order

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/payment"
)

func RegisterOrderRoute(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	paymentService := payment.NewService(app.Config)
	serv := NewService(repo, app.Config, app.Notification, paymentService)
	handler := NewHandler(serv, app.Config)

	router.Post("/", middleware.IsAuthenticated(app.Config), handler.CreateOrder)
	router.Get("/", middleware.IsAuthenticated(app.Config), middleware.IsAdmin, handler.GetAllOrders)
	router.Get("/user/:id", middleware.IsAuthenticated(app.Config), handler.GetUserOrders)
	router.Patch("/:id/status", middleware.IsAuthenticated(app.Config), middleware.IsAdmin, handler.UpdateStatus)
}
