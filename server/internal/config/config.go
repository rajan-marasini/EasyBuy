package config

import (
	"log"

	"github.com/caarlos0/env"
)

type Config struct {
	PORT string `env:"PORT" envDefault:"8000"`

	CLIENT_URL string `env:"CLIENT_URL" envDefault:"http://localhost:3000"`
	API_URL    string `env:"API_URL" envDefault:"http://localhost:8000"`

	DATABASE_URL string `env:"DATABASE_URL"`

	JWT_SECRET string `env:"JWT_SECRET"`

	REDIS_ADDRESS  string `env:"REDIS_ADDRESS" envDefault:""`
	REDIS_PASSWORD string `env:"REDIS_PASSWORD" envDefault:""`
	REDIS_DB       string `env:"REDIS_DB" envDefault:""`

	RABBITMQ_URL string `env:"RABBITMQ_URL" envDefault:"amqp://guest:guest@localhost:5672/"`

	CLOUDINARY_CLOUD_NAME string `env:"CLOUDINARY_CLOUD_NAME"`
	CLOUDINARY_API_KEY    string `env:"CLOUDINARY_API_KEY"`
	CLOUDINARY_API_SECRET string `env:"CLOUDINARY_API_SECRET"`

	ESEWA_PRODUCT_CODE string `env:"ESEWA_PRODUCT_CODE"`
	ESEWA_SECRET_KEY   string `env:"ESEWA_SECRET_KEY"`
	ESEWA_VERIFY_URL   string `env:"ESEWA_VERIFY_URL"`

	KHALTI_LIVE_SECRET_KEY string `env:"KHALTI_LIVE_SECRET_KEY"`
	KHALTI_VERIFY_URL      string `env:"KHALTI_VERIFY_URL"`

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
