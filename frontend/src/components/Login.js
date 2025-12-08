import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, notification, Spin, Select, Modal } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/unnamed.jpg';

// Use window.location.hostname to determine environment with fallback
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
  || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://leave-mangement.onrender.com');
const DEV_BYPASS_OTP = process.env.REACT_APP_DEV_BYPASS_OTP === 'true';
const ALLOWED_EMAIL_DOMAIN = process.env.REACT_APP_ALLOWED_EMAIL_DOMAIN || 'acquiscompliance.com';

console.log('BACKEND_URL:', BACKEND_URL); // Debug: Check resolved backend URL

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
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false); // NEW
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
        console.error('Auth check failed (Login):', error);
        // Clear localStorage on error
        localStorage.removeItem('userData');
      } finally {
        setInitializing(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // SAFETY: if initialization hangs for any reason, clear the initializing spinner after 7s
  useEffect(() => {
    const t = setTimeout(() => {
      setInitializing(prev => {
        if (prev) {
          console.warn('Initialization timeout in Login.js: forcing initializing=false');
          return false;
        }
        return prev;
      });
    }, 7000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Improved handleGetOTP: show server body / status and don't set isOtpSent on errors
  const handleGetOTP = async () => {
    try {
      // Validate email first
      await form.validateFields(['email']);
      const emailValue = form.getFieldValue('email');
      setLoading(true);

      const response = await axios.post(`${BACKEND_URL}/api/send-otp`, {
        email: emailValue
      });

      // If backend returns success true, always allow OTP input to appear.
      if (response?.data && response.data.success) {
        setIsOtpSent(true);
        setEmail(emailValue);
        setOtpTimer(300); // 5 minutes countdown

        // If backend returned OTP in development mode, auto-fill it for quick testing
        if (response.data.otp) {
          form.setFieldsValue({ otp: response.data.otp });
          notification.info({
            message: 'OTP (dev) provided',
            description: 'Server returned an OTP (development). It has been auto-filled.',
            placement: 'top',
          });
          // Also set otpError empty to avoid validation UI
          setOtpError('');
        } else {
          notification.success({
            message: '✅ OTP Sent Successfully!',
            description: response.data.message || 'A verification email has been sent to your inbox.',
            placement: 'top',
            duration: 6,
          });
        }
      } else {
        // Backend responded but indicated failure
        const msg = response?.data?.message || response?.data || 'Failed to send OTP';
        console.warn('send-otp responded with failure:', response?.data);
        notification.error({ message: 'Error', description: String(msg), placement: 'top' });
        setIsOtpSent(false);
      }
    } catch (error) {
      console.error('handleGetOTP error:', error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data || error.response?.statusText;
      const errorMsg = serverMsg || error.message || 'Something went wrong. Please try again.';
      notification.error({
        message: 'Failed to send OTP',
        description: String(errorMsg),
        placement: 'top',
      });
      setIsOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  // Improved handleVerifyOTP: show server message and set otpError from server
  const handleVerifyOTP = async (values) => {
    try {
      setLoading(true);
      setOtpError(''); // Reset error before verifying
      const response = await axios.post(`${BACKEND_URL}/api/verify-otp`, {
        email: form.getFieldValue('email'),
        otp: values.otp
      });

      if (response.data && response.data.success) {
        // If role/department missing, show modal to collect details
        if (!response.data.role || response.data.role === 'Not Assigned' || !response.data.department || response.data.department === 'Not Assigned') {
          // Save email and returned manager info, show modal to pick role/department
          setEmail(form.getFieldValue('email'));
          setUserDetails({
            email: form.getFieldValue('email'),
            manager: response.data.manager || '',
            role: response.data.role || '',
            department: response.data.department || ''
          });
          setIsRoleModalVisible(true);
          // Do not navigate yet
          message.info('Please complete your profile to proceed');
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
      } else {
        // Non-success response payload
        const msg = response?.data?.message || 'OTP verification failed';
        setOtpError(String(msg));
        notification.error({ message: 'Verification Failed', description: String(msg), placement: 'top' });
      }
    } catch (error) {
      console.error('Verification error:', error, error.response?.data);
      // Prefer server message if available
      let errorMsg = error.response?.data?.message || error.response?.data?.error || error.response?.statusText || error.message || 'Something went wrong. Please try again.';
      if (String(errorMsg).toLowerCase().includes('expired')) {
        errorMsg = 'OTP expired. Please request a new OTP.';
      } else if (String(errorMsg).toLowerCase().includes('invalid')) {
        errorMsg = 'Invalid OTP. Please check and try again.';
      }
      setOtpError(String(errorMsg)); // show under the OTP field
      notification.error({
        message: 'Verification Failed',
        description: String(errorMsg),
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

  const handleProceedCancel = () => {
    setIsRoleModalVisible(false);
    // Optionally clear email/userDetails if user cancels
    // setEmail('');
    // setUserDetails(null);
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
          <Form form={form} onFinish={isOtpSent ? handleVerifyOTP : handleGetOTP} className="login-form">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
                // Only enforce domain restriction when not bypassing in dev
                ...(DEV_BYPASS_OTP
                  ? []
                  : [{
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const allowedPattern = new RegExp(`^[A-Za-z0-9._%+-]+@${ALLOWED_EMAIL_DOMAIN.replace('.', '\\.')}$`);
                      return allowedPattern.test(value)
                        ? Promise.resolve()
                        : Promise.reject(new Error(`Please enter an @${ALLOWED_EMAIL_DOMAIN} email address`));
                    }
                  }]
                )
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder={`Enter your ${ALLOWED_EMAIL_DOMAIN} email`}
                size="large"
                disabled={isOtpSent}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="button"
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

          {/* Role / Department modal shown when account incomplete */}
          <Modal
            title="Complete your account"
            open={isRoleModalVisible}             // <-- changed from visible to open
            onCancel={handleProceedCancel}
            footer={null}
            centered
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Select Role</div>
              <Select
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: '100%' }}
                placeholder="Select role"
              >
                <Select.Option value="employee">Employee</Select.Option>
                <Select.Option value="manager">Manager</Select.Option>
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Select Department</div>
              <Select
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                style={{ width: '100%' }}
                placeholder="Select department"
              >
                <Select.Option value="hr">HR</Select.Option>
                <Select.Option value="engineering">Engineering</Select.Option>
                <Select.Option value="sales">Sales</Select.Option>
              </Select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Button onClick={handleProceedCancel}>Cancel</Button>
              <Button
                type="primary"
                onClick={async () => {
                  // Reuse existing handleProceed logic
                  await handleProceed();
                  setIsRoleModalVisible(false);
                }}
                disabled={!selectedRole || !selectedDepartment}
              >
                Proceed
              </Button>
            </div>
          </Modal>
        </div>
      </Spin>
    </div>
  );
};

export default Login;