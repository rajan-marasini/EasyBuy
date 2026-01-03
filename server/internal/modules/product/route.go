package product

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
)

func RegisterProductsRoute(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	serv := NewService(repo)
	handler := NewHandler(serv)

	router.Get("/", handler.CheckHealth)
}
