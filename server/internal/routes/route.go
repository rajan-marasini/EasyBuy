package routes

import (
	"log"

	"github.com/gofiber/contrib/socketio"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/middleware"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/auth"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/category"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/order"
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

	notificationGroup := v1.Group("/notifications")
	notification.RegisterNotificationRoute(notificationGroup, app.Config, app.Notification)

	v1.Get("/ws", middleware.IsAuthenticated(app.Config), socketio.New(func(kws *socketio.Websocket) {
		user := kws.Locals("user").(jwt.MapClaims)
		userID := user["id"].(string)

		// Record this connection in our manager
		app.WSManager.Add(userID, kws.UUID)
		log.Printf("✅ User connected: %s (Socket ID: %s)", userID, kws.UUID)

		// Set a close handler to remove the connection from our manager when it's closed
		// This handles the "socket already closed" issue by ensuring we don't try to send to dead sockets
		kws.Conn.SetCloseHandler(func(code int, text string) error {
			app.WSManager.Remove(userID, kws.UUID)
			log.Printf("❌ User disconnected: %s (Socket ID: %s)", userID, kws.UUID)
			return nil
		})
	}))
}
