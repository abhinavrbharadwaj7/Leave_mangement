import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, notification, Spin } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/unnamed.jpg';

const Login = () => {
  const [form] = Form.useForm();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleGetOTP = async () => {
    try {
      // Validate email first
      await form.validateFields(['email']);
      const emailValue = form.getFieldValue('email');
      setLoading(true);
      
      // Replace with your backend API endpoint
      const response = await axios.post('http://localhost:3001/api/send-otp', {
        email: emailValue
      });

      if (response.data.success) {
        setIsOtpSent(true);
        setEmail(emailValue);
        notification.success({
          message: 'OTP Sent',
          description: 'Please check your email for the OTP',
          placement: 'top',
        });
      }
    } catch (error) {
      if (error.errorFields) {
        return; // Form validation error
      }
      notification.error({
        message: 'Failed to send OTP',
        description: error.response?.data?.message || 'Please try again later',
        placement: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (values) => {
    try {
      setLoading(true);
      // Replace with your backend API endpoint
      const response = await axios.post('http://localhost:3001/api/verify-otp', {
        email: form.getFieldValue('email'),
        otp: values.otp
      });

      if (response.data.success) {
        message.success('Login successful!');
        const role = response.data.role;

        // Navigate to the appropriate dashboard
        if (role === 'manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      }
    } catch (error) {
      notification.error({
        message: 'Verification Failed',
        description: error.response?.data?.message || 'Invalid OTP',
        placement: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (otpTimer === 0) {
      handleGetOTP();
    }
  };

  return (
    <div className="container">
      <Spin spinning={loading}>
        <div className="login-box">
          <div className="logo">
            <img 
              src={logo} 
              alt="Acquis Logo" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h2>Sign in to your workspace</h2>
          
          <Form form={form} onFinish={handleVerifyOTP} className="login-form">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
                {
                  pattern: /^[A-Za-z0-9._%+-]+@acquiscompliance\.com$/,
                  message: 'Please enter a valid Acquis email address'
                }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your Acquis email"
                size="large"
                disabled={isOtpSent}
              />
            </Form.Item>

            <Button 
              type="primary" 
              onClick={handleGetOTP}
              disabled={isOtpSent && loading}
              className="submit-btn"
              size="large"
              loading={loading}
            >
              {isOtpSent ? 'Resend OTP' : 'Get OTP'}
            </Button>

            {isOtpSent && (
              <Form.Item
                name="otp"
                rules={[
                  { required: true, message: 'Please input your OTP!' },
                  { pattern: /^\d{6}$/, message: 'OTP must be 6 digits!' }
                ]}
              >
                <Input
                  placeholder="Enter 6-digit OTP"
                  size="large"
                  maxLength={6}
                />
              </Form.Item>
            )}

            {isOtpSent && (
              <Button 
                type="primary" 
                htmlType="submit"
                className="submit-btn"
                size="large"
                loading={loading}
              >
                Verify OTP
              </Button>
            )}
          </Form>

          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          
          <div className="footer">
            © Copyright Acquis Compliance 2020 - {new Date().getFullYear()}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default Login;
