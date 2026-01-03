package auth

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
)

func RegisterAuthRoute(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	serv := NewService(repo, app.Config)
	handler := NewHandler(serv, app.Config)

	router.Post("/register", handler.RegisterUser)
	router.Post("/login", handler.LoginUser)
	router.Post("/logout", middleware.IsAuthenticated(app.Config), handler.LogoutUser)

}
