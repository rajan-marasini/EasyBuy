package user

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
)

func RegisterUserRoutes(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	serv := NewService(repo)
	handler := NewHandler(serv)

	// Admin only routes
	router.Use(middleware.IsAuthenticated(app.Config))
	router.Use(middleware.IsAdmin)

	router.Get("/", handler.GetAll)
	router.Get("/:id", handler.GetByID)
	router.Post("/", handler.Create)
	router.Patch("/:id", handler.Update)
	router.Delete("/:id", handler.Delete)
}
