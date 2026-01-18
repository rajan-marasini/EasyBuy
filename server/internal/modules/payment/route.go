package payment

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
)

func RegisterPaymentRoutes(router fiber.Router, app *app.AppWrapper) {
	paymentService := NewService(app.Config)
	paymentHandler := NewHandler(paymentService)

	router.Post("/verify/esewa", paymentHandler.VerifyEsewa)
}
