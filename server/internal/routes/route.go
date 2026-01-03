package routes

import (
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/auth"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/product"
)

func RegisterRoutes(app *app.AppWrapper) {
	api := app.Group("/api")
	v1 := api.Group("/v1")

	authGroup := v1.Group("/auth")
	auth.RegisterAuthRoute(authGroup, app)

	productGroup := v1.Group("/products")
	product.RegisterProductsRoute(productGroup, app)
}
