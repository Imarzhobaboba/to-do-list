package db

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

func InitRedis(addr string) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "",
		DB:       0,
	})
}

func SetCache(rdb *redis.Client, key string, value interface{}, expiration time.Duration) error {
	ctx := context.Background()
	return rdb.Set(ctx, key, value, expiration).Err()
}

func GetCache(rdb *redis.Client, key string) (string, error) {
	ctx := context.Background()
	return rdb.Get(ctx, key).Result()
}
