package handlers

import (
	"net/http"
	"strconv"
	"time"

	"backend/models"
	"backend/repositories"

	"github.com/gin-gonic/gin"
)

type TaskHandler struct {
	taskRepo  *repositories.TaskRepository
	redisRepo *repositories.RedisRepository
}

func NewTaskHandler(taskRepo *repositories.TaskRepository, redisRepo *repositories.RedisRepository) *TaskHandler {
	return &TaskHandler{
		taskRepo:  taskRepo,
		redisRepo: redisRepo,
	}
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.taskRepo.Create(&task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Кэшируем на 30 секунд
	h.redisRepo.CacheTask(&task, 30*time.Second)

	c.JSON(http.StatusCreated, task)
}

func (h *TaskHandler) GetTask(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	// Пробуем получить из кэша
	if task, err := h.redisRepo.GetCachedTask(uint(id)); err == nil {
		c.JSON(http.StatusOK, task)
		return
	}

	// Если нет в кэше - ищем в БД
	task, err := h.taskRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	// Кэшируем результат
	h.redisRepo.CacheTask(task, 30*time.Second)

	c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) UpdateTask(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
	}

	var task models.Task

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	task.ID = uint(id)

	existingTask, err := h.taskRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if task.Title != "" {
		existingTask.Title = task.Title
	}
	if task.Completed != existingTask.Completed {
		existingTask.Completed = task.Completed
	}

	if err := h.taskRepo.Update(&task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.redisRepo.CacheTask(&task, 30*time.Second)

	c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) DeleteTask(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	if _, err := h.taskRepo.GetByID(uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if err := h.taskRepo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Пробуем получить из кэша
	if task, err := h.redisRepo.GetCachedTask(uint(id)); err == nil {
		c.JSON(http.StatusOK, task)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *TaskHandler) GetAllTasks(c *gin.Context) {
	var tasks []models.Task

	tasks, err := h.taskRepo.GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tasks)
}
