import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TaskForm from '../components/TaskForm';
import * as api from '../services/api';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      message.error(`Failed to fetch tasks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = () => {
    setCurrentTask(null);
    setModalVisible(true);
  };

  const handleEdit = (task) => {
    setCurrentTask(task);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTask(id);
      message.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      message.error(`Delete failed: ${error.message}`);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (currentTask) {
        await api.updateTask(currentTask.id, values);
        message.success('Task updated successfully');
      } else {
        await api.createTask(values);
        message.success('Task created successfully');
      }
      setModalVisible(false);
      fetchTasks();
    } catch (error) {
      message.error(`Operation failed: ${error.message}`);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed) => (
        <Tag color={completed ? 'green' : 'volcano'}>
          {completed ? 'Completed' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Delete task?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
      >
        Add Task
      </Button>

      <Table 
        dataSource={tasks} 
        columns={columns} 
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <TaskForm
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={currentTask}
      />
    </div>
  );
};

export default TaskPage;