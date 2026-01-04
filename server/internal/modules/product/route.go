package product

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
)

func RegisterProductsRoute(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	serv := NewService(repo)
	handler := NewHandler(serv)

	//public route
	router.Get("/", handler.GetAllProducts)
	router.Get("/:productID", handler.GetProductById)

	//protected route
	router.Post("/", middleware.IsAuthenticated(app.Config), middleware.IsAdmin, handler.CreateProduct)
	router.Put("/:productID", middleware.IsAuthenticated(app.Config), middleware.IsAdmin, handler.UpdateProduct)
}
