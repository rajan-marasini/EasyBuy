package review

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
)

func RegisterReviewRoute(router fiber.Router, app *app.AppWrapper) {
	repo := NewRepository(app.DB, app.Redis)
	serv := NewService(repo)
	handler := NewHandler(serv)

	router.Get("/product/:productId", handler.GetProductReviews)

	// Protected routes
	router.Post("/", middleware.IsAuthenticated(app.Config), handler.CreateReview)
	router.Patch("/:reviewId", middleware.IsAuthenticated(app.Config), handler.UpdateReview)
	router.Delete("/:id", middleware.IsAuthenticated(app.Config), handler.DeleteReview)

}
