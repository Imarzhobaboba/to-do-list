package main

import (
	"log"

	"backend/db"
	"backend/handlers"
	"backend/models"
	"backend/repositories"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	// Инициализация БД
	pgDB, err := db.InitPostgres(
		"postgres", // хост из docker-compose
		"postgres",
		"postgres",
		"postgres",
		"5432",
	)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Автомиграция
	pgDB.AutoMigrate(&models.Task{})

	// Инициализация Redis
	redisClient := db.InitRedis("redis:6379") // адрес из docker-compose

	// Инициализация репозиториев
	taskRepo := repositories.NewTaskRepository(pgDB)
	redisRepo := repositories.NewRedisRepository(redisClient)

	// Инициализация обработчиков
	taskHandler := handlers.NewTaskHandler(taskRepo, redisRepo)

	// Настройка роутера
	r := gin.Default()
	r.Use(CORSMiddleware())

	r.POST("/tasks", taskHandler.CreateTask)
	r.GET("/tasks/:id", taskHandler.GetTask)
	r.PUT("/tasks/:id", taskHandler.UpdateTask)
	r.DELETE("/tasks/:id", taskHandler.DeleteTask)
	r.GET("/tasks", taskHandler.GetAllTasks)

	// Запуск сервера
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
