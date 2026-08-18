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
	var opts *redis.Options
	if opt, err := redis.ParseURL(cfg.REDIS_ADDRESS); err == nil {
		opts = opt
	} else {
		db, _ := strconv.Atoi(cfg.REDIS_DB)
		opts = &redis.Options{
			Addr:     cfg.REDIS_ADDRESS,
			Password: cfg.REDIS_PASSWORD,
			DB:       db,
		}
	}

	rdb := redis.NewClient(opts)

	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Println("Redis Connection Failed:", err)
		os.Exit(1)
	} else {
		log.Println("Redis connected successfully")
	}

	return rdb
}
