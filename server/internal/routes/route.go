package routes

import (
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/auth"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/category"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/order"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/payment"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/product"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/review"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/user"
)

func RegisterRoutes(app *app.AppWrapper) {
	api := app.Group("/api")
	v1 := api.Group("/v1")

	authGroup := v1.Group("/auth")
	auth.RegisterAuthRoute(authGroup, app)

	productGroup := v1.Group("/products")
	product.RegisterProductsRoute(productGroup, app)

	categoryGroup := v1.Group("/categories")
	category.RegisterCategoryRoutes(categoryGroup, app)

	userGroup := v1.Group("/users")
	user.RegisterUserRoutes(userGroup, app)

	reviewGroup := v1.Group("/reviews")
	review.RegisterReviewRoute(reviewGroup, app)

	orderGroup := v1.Group("/orders")
	order.RegisterOrderRoute(orderGroup, app)

	paymentGroup := v1.Group("/payments")
	payment.RegisterPaymentRoutes(paymentGroup, app)
}
