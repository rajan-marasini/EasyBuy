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
	"github.com/rajan-marasini/EasyBuy/server/internal/routes"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("[Error]:", err.Error())
	}
}

func main() {
	cfg := config.Load()

	quitChan := make(chan os.Signal, 1)
	signal.Notify(quitChan, os.Interrupt, syscall.SIGTERM)

	db := database.Connect(cfg)
	database.Migrate(db)

	app := app.NewFiberApp(cfg, db)

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
	log.Println("Shutting down server...")
	if err := app.Shutdown(); err != nil {
		log.Println("Error shutting the server")
	}
	log.Println("Server shut down gracefully")
}
