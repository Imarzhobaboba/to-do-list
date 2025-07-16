import React, { useState, useEffect } from 'react';
import { Button, List, Input, Card, Checkbox, message, Spin } from 'antd';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.trim()) {
      message.warning('Please enter a task');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask, completed: false }),
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      setNewTask('');
      await fetchTasks();
      message.success('Task created successfully');
    } catch (error) {
      message.error(error.message);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      await fetchTasks();
    } catch (error) {
      message.error(error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      await fetchTasks();
      message.success('Task deleted successfully');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div className="app-container">
      <Card 
        title="To-Do List" 
        className="todo-card"
        extra={<div className="tasks-count">{tasks.length} tasks</div>}
      >
        <div className="task-input-container">
          <Input 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter new task"
            onPressEnter={createTask}
            className="task-input"
          />
          <Button 
            type="primary" 
            onClick={createTask}
            disabled={!newTask.trim()}
          >
            Add Task
          </Button>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <List
            dataSource={tasks}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button 
                    danger 
                    onClick={() => deleteTask(item.id)}
                    className="delete-btn"
                  >
                    Delete
                  </Button>
                ]}
                className="task-item"
              >
                <List.Item.Meta
                  avatar={
                    <Checkbox
                      checked={item.completed}
                      onChange={() => toggleTask(item.id, item.completed)}
                    />
                  }
                  title={
                    <span 
                      style={{ 
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? '#999' : 'inherit'
                      }}
                    >
                      {item.title}
                    </span>
                  }
                  description={`Created: ${new Date(item.created_at).toLocaleString()}`}
                />
              </List.Item>
            )}
            locale={{ emptyText: "No tasks yet. Add your first task!" }}
          />
        )}
      </Card>
    </div>
  );
}

export default App;