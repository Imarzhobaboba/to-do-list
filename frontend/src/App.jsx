import React, { useState, useEffect } from 'react';
import { Button, List, Input, Card } from 'antd';

const API_URL = 'http://localhost:8080/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setTasks(data);
  };

  const createTask = async () => {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask, completed: false }),
    });
    setNewTask('');
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  return (
    <Card title="To-Do List" style={{ width: 500, margin: '20px auto' }}>
      <Input 
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Enter new task"
        onPressEnter={createTask}
      />
      
      <List
        dataSource={tasks}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button danger onClick={() => deleteTask(item.id)}>
                Delete
              </Button>
            ]}
          >
            <List.Item.Meta title={item.title} />
          </List.Item>
        )}
      />
    </Card>
  );
}

export default App;