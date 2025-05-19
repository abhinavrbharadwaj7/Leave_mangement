import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './Login.css';

const Login = () => {
  const [isActive, setIsActive] = useState(false);
  const [employeeForm] = Form.useForm();
  const [managerForm] = Form.useForm();

  const handleEmployeeLogin = (values) => {
    console.log('Employee login:', values);
  };

  const handleManagerLogin = (values) => {
    console.log('Manager login:', values);
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`}>
      <div className="form-box login">
        <Form form={employeeForm} onFinish={handleEmployeeLogin}>
          <h1>Employee Login</h1>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your employee ID!' }]}
            className="input-box"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Employee ID"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            className="input-box"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>
          <div className="forgot-link">
            <a href="#">Forgot Password?</a>
          </div>
          <Button type="primary" htmlType="submit" className="btn">Login as Employee</Button>
        </Form>
      </div>

      <div className="form-box register">
        <Form form={managerForm} onFinish={handleManagerLogin}>
          <h1>Manager Login</h1>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your manager ID!' }]}
            className="input-box"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Manager ID"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            className="input-box"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>
          <div className="forgot-link">
            <a href="#">Forgot Password?</a>
          </div>
          <Button type="primary" htmlType="submit" className="btn">Login as Manager</Button>
        </Form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Employee Portal</h1>
          <p>Switch to employee login</p>
          <button className="btn" onClick={() => setIsActive(false)}>
            Employee Login
          </button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>Manager Portal</h1>
          <p>Switch to manager login</p>
          <button className="btn" onClick={() => setIsActive(true)}>
            Manager Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
