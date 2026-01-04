package category

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
)

func RegisterCategoryRoutes(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	serv := NewService(repo)
	handler := NewHandler(serv)

	// Public routes
	router.Get("/", handler.GetAll)
	router.Get("/:id", handler.GetByID)

	// Protected routes (Admin only)
	router.Post("/", middleware.IsAuthenticated(app.Config), middleware.IsAdmin, handler.Create)
	router.Patch("/:id", middleware.IsAuthenticated(app.Config), middleware.IsAdmin, handler.Update)
	router.Delete("/:id", middleware.IsAuthenticated(app.Config), middleware.IsAdmin, handler.Delete)
}
