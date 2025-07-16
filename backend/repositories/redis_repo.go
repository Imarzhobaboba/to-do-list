package repositories

import (
	"encoding/json"
	"time"

	"backend/db"
	"backend/models"

	"github.com/redis/go-redis/v9"
)

type RedisRepository struct {
	client *redis.Client
}

func NewRedisRepository(client *redis.Client) *RedisRepository {
	return &RedisRepository{client: client}
}

func (r *RedisRepository) CacheTask(task *models.Task, duration time.Duration) error {
	jsonData, err := json.Marshal(task)
	if err != nil {
		return err
	}
	return db.SetCache(r.client, "task:"+string(task.ID), jsonData, duration)
}

func (r *RedisRepository) GetCachedTask(id uint) (*models.Task, error) {
	data, err := db.GetCache(r.client, "task:"+string(id))
	if err != nil {
		return nil, err
	}

	var task models.Task
	if err := json.Unmarshal([]byte(data), &task); err != nil {
		return nil, err
	}

	return &task, nil
}
