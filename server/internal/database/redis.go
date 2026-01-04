package database

import (
	"context"
	"log"
	"os"
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

	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Println("Redis Connection Failed")
		os.Exit(1)
	} else {
		log.Println("Redis connected successfully")
	}

	return rdb
}
