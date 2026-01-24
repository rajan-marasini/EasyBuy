package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"

	"github.com/rajan-marasini/EasyBuy/server/internal/app"
	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/rajan-marasini/EasyBuy/server/internal/database"
	"github.com/rajan-marasini/EasyBuy/server/internal/modules/notification"
	"github.com/rajan-marasini/EasyBuy/server/internal/queue"
	"github.com/rajan-marasini/EasyBuy/server/internal/routes"
	"github.com/rajan-marasini/EasyBuy/server/internal/worker"
	"github.com/rajan-marasini/EasyBuy/server/internal/ws"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("[Error]:", err.Error())
	}

	cfg := config.Load()

	quitChan := make(chan os.Signal, 1)
	signal.Notify(quitChan, os.Interrupt, syscall.SIGTERM)

	db := database.Connect(cfg)
	database.Migrate(db)

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	rdb := database.ConnectRedis(cfg)
	defer rdb.Close()

	rabbit, err := queue.NewRabbitMQ(cfg)
	if err != nil {
		log.Fatal("[RabbitMQ Error]:", err.Error())
	}
	defer rabbit.Close()

	notificationRepo := notification.NewRepository(db, rdb)
	notificationService := notification.NewNotificationService(notificationRepo, rabbit)
	wsManager := ws.NewWSManager()
	emailWorker := worker.NewEmailWorker(rabbit, cfg)
	notificationWorker := worker.NewNotificationWorker(rabbit, cfg, wsManager)

	go emailWorker.Start()
	go notificationWorker.Start()

	app := app.NewFiberApp(cfg, db, rdb, rabbit, notificationService, wsManager)

	routes.RegisterRoutes(app)

	go func() {
		log.Println("Server running on port", cfg.PORT)
		if err := app.Listen(fmt.Sprintf(":%s", cfg.PORT)); err != nil {
			log.Fatal("[Error]:", err.Error())
		}
	}()

	handleGracefulShutdown(app, quitChan)
}

func handleGracefulShutdown(app *app.AppWrapper, quitChan chan os.Signal) {
	<-quitChan
	log.Println("Shutdown signal received")
	if err := app.Shutdown(); err != nil {
		log.Fatal("Error shutting down server:", err)
	}
	log.Println("Server shut down gracefully")
}
