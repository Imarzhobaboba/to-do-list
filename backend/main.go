package main

import (
	"log"
	"todo-backend/db"
	"todo-backend/handlers"
	"todo-backend/models"
	"todo-backend/repositories"

	"github.com/gin-gonic/gin"
)

func main() {
	// Инициализация БД
	pgDB, err := db.InitPostgres(
		"postgres", // хост из docker-compose
		"user",
		"password",
		"todo_db",
		5432,
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
