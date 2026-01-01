package config

import (
	"log"

	"github.com/caarlos0/env"
)

type Config struct {
	PORT string `env:"PORT" envDefault:"8000"`
}

func Load() *Config {
	var cfg Config
	err := env.Parse(&cfg)
	if err != nil {
		log.Fatal("[Error]: ", err.Error())
	}
	return &cfg
}
