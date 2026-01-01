package config

import (
	"log"

	"github.com/caarlos0/env"
)

type Config struct {
	PORT              string `env:"PORT" envDefault:"8000"`
	CLIENT_URL        string `env:"CLIENT_URL" envDefault:"http://localhost:3000"`
	DATABASE_HOST     string `env:"DATABASE_HOST" envDefault:"localhost"`
	DATABASE_PORT     string `env:"DATABASE_PORT" envDefault:"5432"`
	DATABASE_NAME     string `env:"DATABASE_NAME" envDefault:"easybuy"`
	DATABASE_USER     string `env:"DATABASE_USER" envDefault:"postgres"`
	DATABASE_PASSWORD string `env:"DATABASE_PASSWORD" envDefault:"postgres"`
	DATABASE_SSLMODE  string `env:"DATABASE_SSL" envDefault:"disable"`
}

func Load() *Config {
	var cfg Config
	err := env.Parse(&cfg)
	if err != nil {
		log.Fatal("[Error]: ", err.Error())
	}
	return &cfg
}
