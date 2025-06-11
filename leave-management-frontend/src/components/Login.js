import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, notification, Spin, Select } from 'antd';
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
  const [userDetails, setUserDetails] = useState(null); // Store user details
  const [selectedRole, setSelectedRole] = useState(''); // Track selected role
  const [selectedDepartment, setSelectedDepartment] = useState(''); // Track selected department
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      const userData = JSON.parse(savedUserData);
      if (userData.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    }
  }, [navigate]);

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
      if (error.response) {
        notification.error({
          message: 'Error',
          description: error.response.data.message,
          placement: 'top',
        });
      } else {
        notification.error({
          message: 'Error',
          description: 'Something went wrong. Please try again or contact support.',
          placement: 'top',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/api/verify-otp', {
        email: form.getFieldValue('email'),
        otp: values.otp
      });

      if (response.data.success) {
        message.success('Login successful!');
        const userData = {
          email: form.getFieldValue('email'),
          role: response.data.role,
          department: response.data.department,
          manager: response.data.manager
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));

        // Redirect based on role
        if (response.data.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (response.data.role === 'manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      }
    } catch (error) {
      notification.error({
        message: 'Verification Failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        placement: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (selectedRole && selectedDepartment) {
      try {
        // Save user details locally
        const userData = {
          email,
          role: selectedRole,
          department: selectedDepartment,
          manager: userDetails.manager
        };
        localStorage.setItem('userData', JSON.stringify(userData));

        // Navigate based on role
        if (selectedRole === 'manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      } catch (error) {
        message.error('Error saving user details');
        console.error('Error:', error);
      }
    } else {
      message.error('Please select both role and department before proceeding.');
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
          
          {!userDetails ? (
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
          ) : (
            <div className="user-details-card">
              <h3>User Details</h3>
              <p><b>Manager:</b> {userDetails.manager}</p>
              <p><b>Select Role:</b></p>
              <Select
                placeholder="Select your role"
                style={{ width: '100%' }}
                onChange={(value) => setSelectedRole(value)}
              >
                <Select.Option value="employee">Employee</Select.Option>
                <Select.Option value="manager">Manager</Select.Option>
              </Select>
              <p style={{ marginTop: '20px' }}><b>Select Department:</b></p>
              <Select
                placeholder="Select your department"
                style={{ width: '100%' }}
                onChange={(value) => setSelectedDepartment(value)}
              >
                <Select.Option value="hr">HR</Select.Option>
                <Select.Option value="engineering">Engineering</Select.Option>
                <Select.Option value="sales">Sales</Select.Option>
              </Select>
              <Button type="primary" onClick={handleProceed} className="submit-btn" style={{ marginTop: '20px' }}>
                Proceed to Dashboard
              </Button>
            </div>
          )}

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
