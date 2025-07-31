import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, notification, Spin, Select } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/unnamed.jpg';

// Use window.location.hostname to determine environment
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
console.log('BACKEND_URL:', BACKEND_URL); // Debug: Check if env variable is loaded

const Login = () => {
  const [form] = Form.useForm();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [userDetails, setUserDetails] = useState(null); // Store user details
  const [selectedRole, setSelectedRole] = useState(''); // Track selected role
  const [selectedDepartment, setSelectedDepartment] = useState(''); // Track selected department
  const [initializing, setInitializing] = useState(true);
  const [otpError, setOtpError] = useState(''); // <-- Add this line
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);

          // Use dynamic BACKEND_URL here
          const response = await axios.get(`${BACKEND_URL}/api/check-user/${userData.email}`);

          if (!response.data.exists) {
            // User doesn't exist in MongoDB, clear localStorage
            localStorage.removeItem('userData');
            setInitializing(false);
            return;
          }

          // User exists, proceed with navigation
          if (userData.role === 'admin') {
            navigate('/admin');
          } else if (userData.role === 'manager') {
            navigate('/manager-dashboard');
          } else {
            navigate('/employee-dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear localStorage on error
        localStorage.removeItem('userData');
      } finally {
        setInitializing(false);
      }
    };
    checkAuth();
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
      const response = await axios.post(`${BACKEND_URL}/api/send-otp`, {
        email: emailValue
      });

      if (response.data.success) {
        setIsOtpSent(true);
        setEmail(emailValue);
        setOtpTimer(300); // 5 minutes countdown
        notification.success({
          message: '✅ OTP Sent Successfully!',
          description: 'A professional verification email has been sent to your inbox. Please check your email (including spam folder) for the OTP code.',
          placement: 'top',
          duration: 6,
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
      setOtpError(''); // Reset error before verifying
      const response = await axios.post(`${BACKEND_URL}/api/verify-otp`, {
        email: form.getFieldValue('email'),
        otp: values.otp
      });

      if (response.data.success) {
        if (!response.data.role || response.data.role === 'Not Assigned' || !response.data.department || response.data.department === 'Not Assigned') {
          message.error('Your account is not fully set up. Please contact admin.');
          return;
        }
        const userData = {
          email: form.getFieldValue('email'),
          role: response.data.role,
          department: response.data.department,
          manager: response.data.manager
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else if (response.data.role === 'manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
        message.success('OTP verified successfully');
      }
    } catch (error) {
      console.error('Verification error:', error);
      let errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      if (errorMsg.toLowerCase().includes('expired')) {
        errorMsg = 'OTP expired. Please request a new OTP.';
      } else if (errorMsg.toLowerCase().includes('invalid')) {
        errorMsg = 'Invalid OTP. Please check and try again.';
      }
      setOtpError(errorMsg); // <-- Set OTP error for UI
      notification.error({
        message: 'Verification Failed',
        description: errorMsg,
        placement: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (selectedRole && selectedDepartment) {
      try {
        setLoading(true);
        const response = await axios.post(`${BACKEND_URL}/api/update-user-details`, {
          email,
          role: selectedRole,
          department: selectedDepartment
        });

        if (response.data.success) {
          const userData = {
            email,
            role: selectedRole,
            department: selectedDepartment,
            manager: userDetails.manager
          };

          localStorage.clear();
          localStorage.setItem('userData', JSON.stringify(userData));
          message.success('Details updated successfully');

          // Strict navigation based on role
          if (selectedRole === 'manager') {
            navigate('/manager-dashboard', { replace: true });
          } else if (selectedRole === 'employee') {
            navigate('/employee-dashboard', { replace: true });
          }
        }
      } catch (error) {
        message.error('Error saving user details. Please try again.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
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

  if (initializing) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

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
                validateStatus={otpError ? "error" : ""}
                help={otpError}
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