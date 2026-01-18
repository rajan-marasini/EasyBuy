package config

import (
	"log"

	"github.com/caarlos0/env"
)

type Config struct {
	PORT string `env:"PORT" envDefault:"8000"`

	CLIENT_URL string `env:"CLIENT_URL" envDefault:"http://localhost:3000"`
	API_URL    string `env:"API_URL" envDefault:"http://localhost:8000"`

	DATABASE_HOST     string `env:"DATABASE_HOST" envDefault:"localhost"`
	DATABASE_PORT     string `env:"DATABASE_PORT" envDefault:"5432"`
	DATABASE_NAME     string `env:"DATABASE_NAME" envDefault:"easybuy"`
	DATABASE_USER     string `env:"DATABASE_USER" envDefault:"postgres"`
	DATABASE_PASSWORD string `env:"DATABASE_PASSWORD" envDefault:"postgres"`
	DATABASE_SSLMODE  string `env:"DATABASE_SSL" envDefault:"disable"`

	JWT_SECRET string `env:"JWT_SECRET" envDefault:"secret"`

	REDIS_ADDRESS  string `env:"REDIS_ADDRESS" envDefault:""`
	REDIS_PASSWORD string `env:"REDIS_PASSWORD" envDefault:""`
	REDIS_DB       string `env:"REDIS_DB" envDefault:""`

	RABBITMQ_URL string `env:"RABBITMQ_URL" envDefault:"amqp://guest:guest@localhost:5672/"`

	CLOUDINARY_CLOUD_NAME string `env:"CLOUDINARY_CLOUD_NAME"`
	CLOUDINARY_API_KEY    string `env:"CLOUDINARY_API_KEY"`
	CLOUDINARY_API_SECRET string `env:"CLOUDINARY_API_SECRET"`

	ESEWA_PRODUCT_CODE string `env:"ESEWA_PRODUCT_CODE" envDefault:"EPAYTEST"`
	ESEWA_SECRET_KEY   string `env:"ESEWA_SECRET_KEY" envDefault:"8gBm/:&EnhH.1/q"`

	SMTP_HOST     string `env:"SMTP_HOST" envDefault:"smtp.gmail.com"`
	SMTP_PORT     string `env:"SMTP_PORT" envDefault:"587"`
	SMTP_USER     string `env:"SMTP_USER"`
	SMTP_PASSWORD string `env:"SMTP_PASSWORD"`
}

func Load() *Config {
	var cfg Config
	err := env.Parse(&cfg)
	if err != nil {
		log.Fatal("[Error]: ", err.Error())
	}
	return &cfg
}
