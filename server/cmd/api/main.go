package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
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

	db := database.Connect(cfg)
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("[PostgreSQL Error]:", err)
	}
	rdb := database.ConnectRedis(cfg)
	rabbit, err := queue.NewRabbitMQ(cfg)
	if err != nil {
		_ = rdb.Close()
		_ = sqlDB.Close()
		log.Fatal("[RabbitMQ Error]:", err)
	}

	notificationRepo := notification.NewRepository(db, rdb)
	notificationService := notification.NewNotificationService(notificationRepo, rabbit)
	wsManager := ws.NewWSManager()
	emailWorker := worker.NewEmailWorker(rabbit, cfg)
	notificationWorker := worker.NewNotificationWorker(rabbit, cfg, wsManager)

	workerCtx, cancelWorkers := context.WithCancel(context.Background())
	var workerWG sync.WaitGroup
	workerWG.Add(2)
	go func() {
		defer workerWG.Done()
		emailWorker.Start(workerCtx)
	}()
	go func() {
		defer workerWG.Done()
		notificationWorker.Start(workerCtx)
	}()

	application := app.NewFiberApp(cfg, db, rdb, rabbit, notificationService, wsManager)
	routes.RegisterRoutes(application)

	serverErr := make(chan error, 1)
	go func() {
		log.Println("Server running on port", cfg.PORT)
		serverErr <- application.Listen(fmt.Sprintf(":%s", cfg.PORT))
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	select {
	case sig := <-quit:
		log.Printf("Shutdown signal received: %s", sig)
	case err := <-serverErr:
		if err != nil {
			log.Printf("HTTP server stopped: %v", err)
		}
	}
	signal.Stop(quit)

	// Stop accepting requests before cancelling consumers. Cancelling the
	// worker contexts makes ConsumeWithContext unregister consumers cleanly.
	if err := application.Shutdown(); err != nil {
		log.Printf("Error shutting down HTTP server: %v", err)
	}
	cancelWorkers()
	workerWG.Wait()
	rabbit.Close()
	if err := rdb.Close(); err != nil {
		log.Printf("Error closing Redis: %v", err)
	}
	if err := sqlDB.Close(); err != nil {
		log.Printf("Error closing PostgreSQL: %v", err)
	}
	log.Println("Server shut down gracefully")
}