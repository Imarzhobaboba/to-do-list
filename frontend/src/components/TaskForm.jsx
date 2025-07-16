import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Modal } from 'antd';

const TaskForm = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initialValues || { title: '', completed: false });
  }, [initialValues, form]);

  return (
    <Modal
      open={open}
      title={initialValues?.id ? "Edit Task" : "Create Task"}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSubmit(values)}
      >
        <Form.Item
            name="title"
            label="Title"
            rules={[
                { required: true, message: 'Please enter title' },
                { max: 100, message: 'Title must be less than 100 characters' }
            ]}
            >
            <Input />
        </Form.Item>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="completed" valuePropName="checked">
          <Checkbox>Completed</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {initialValues?.id ? "Update" : "Create"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;