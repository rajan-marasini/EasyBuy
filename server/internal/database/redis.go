package database

import (
	"log"
	"strconv"

	"github.com/rajan-marasini/EasyBuy/server/internal/config"
	"github.com/redis/go-redis/v9"
)

func ConnectRedis(cfg *config.Config) *redis.Client {
	db, _ := strconv.Atoi(cfg.REDIS_DB)
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.REDIS_ADDRESS,
		Password: cfg.REDIS_PASSWORD,
		DB:       db,
	})

	log.Println("Redis connected successfully")

	return rdb
}
