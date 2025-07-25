// EmployeeDashboard.js
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Card, Progress, DatePicker, Select, Modal, Input, Spin, Form, message } from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  CalendarOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [leaveForm] = Form.useForm();
  const [leaveType, setLeaveType] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [reason, setReason] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          navigate('/');
          return;
        }
        
        const user = JSON.parse(userData);
        if (user.role !== 'employee' && user.role !== 'manager') {
          navigate('/');
          return;
        }
        // Set user email from localStorage
        setUserEmail(user.email);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/');
      } finally {
        setInitializing(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const showModal = () => setModalVisible(true);
  const handleCancel = () => setModalVisible(false);

  // Fetch leave history for the logged-in user
  const fetchLeaveHistory = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.email) return;
      const response = await axios.get(`${BACKEND_URL}/api/leave-requests/${userData.email}`);
      if (response.data.success) {
        setLeaveHistory(response.data.leaveRequests);
      }
    } catch (error) {
      console.error('Error fetching leave history:', error);
    }
  };

  // Fetch all leave requests
  const fetchAllLeaveRequests = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/all-leave-requests`);
      if (response.data.success) {
        setAllLeaveRequests(response.data.leaveRequests);
      }
    } catch (error) {
      console.error('Error fetching all leave requests:', error);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const storedData = JSON.parse(localStorage.getItem('userData'));
      if (!storedData?.email) return;

      const response = await axios.get(`${BACKEND_URL}/api/user/${storedData.email}`);
      if (response.data.success) {
        setUserData(response.data.user);
        setUserEmail(response.data.user.email);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Failed to load user details');
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
    fetchAllLeaveRequests();
    fetchUserData();
  }, []);

  const handleLeaveSubmit = async (values) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.email) {
        message.error('User data not found. Please login again.');
        return;
      }

      console.log('Submitting leave request:', {
        email: userData.email,
        ...values,
        dateRange: values.dateRange.map(date => date.format('YYYY-MM-DD'))
      });

      const response = await axios.post(`${BACKEND_URL}/api/leave-request`, {
        email: userData.email,
        leaveType: values.leaveType,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason,
        manager: userData.manager // <-- include manager
      });

      if (response.data.success) {
        message.success('Leave request submitted successfully');
        setModalVisible(false);
        leaveForm.resetFields();
        fetchLeaveHistory(); // Refresh the history
        fetchAllLeaveRequests(); // Refresh all leave requests
      }
    } catch (error) {
      console.error('Leave request error:', error);
      message.error('Failed to submit leave request. Please try again.');
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
    <Layout className="dashboard-layout">
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          onClick={(e) => setActiveSection(e.key)}
        >
          <Menu.Item key="dashboard" icon={<UserOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="history" icon={<HistoryOutlined />}>History</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="dashboard-header">
          <div className="header-left">
            <span className="welcome-text">Welcome back,</span>
            <span className="user-name">
              {localStorage.getItem('userData') ? 
                JSON.parse(localStorage.getItem('userData')).email.split('@')[0] : 
                'Employee'}
            </span>
            <span className="wave-emoji">👋</span>
          </div>
          <div className="user-info">
            <span className="department-tag">
              {userData?.department || 'Loading...'}
            </span>
          </div>
          <div className="header-right">
            <Button type="primary" icon={<FileAddOutlined />} onClick={showModal} className="request-btn">
              Request Time Off
            </Button>
          </div>
        </Header>
        <Content className="dashboard-content">
          {activeSection === 'dashboard' && (
            <>
              <div className="leave-summary-card">
                <h3>Leave Summary</h3>
                <div className="leave-progress">
                  <div>
                    <Progress type="dashboard" percent={40} strokeColor="magenta" />
                    <p>Casual Leave</p>
                    <p>Available: 3 | Used: 2 | Total: 5</p>
                  </div>
                  <div>
                    <Progress type="dashboard" percent={20} strokeColor="blue" />
                    <p>Sick Leave</p>
                    <p>Available: 4 | Used: 1 | Total: 5</p>
                  </div>
                  <div>
                    <Progress type="dashboard" percent={20} strokeColor="green" />
                    <p>Earned Leave</p>
                    <p>Available: 8 | Used: 2 | Total: 10</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <Card title="Who's on Leave" hoverable className="dashboard-card" extra={<UserOutlined />}>
                  <p>On Leave: {allLeaveRequests.filter(req => req.status === 'approved').length}</p>
                  <div className="on-leave-list">
                    {allLeaveRequests
                      .filter(req => req.status === 'approved')
                      .map((leave, index) => (
                        <div key={index} className="on-leave-item">
                          <div className="leave-user">{leave.email.split('@')[0]}</div>
                          <span className="leave-type">{leave.leaveType}</span>
                          <div className="leave-date">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>

                <Card title="Pending Leave Requests" hoverable className="dashboard-card" extra={<CalendarOutlined />}>
                  <div className="pending-leave-list">
                    {allLeaveRequests.filter(req => req.status === 'pending').length > 0 ? (
                      allLeaveRequests
                        .filter(req => req.status === 'pending')
                        .map((leave, index) => (
                          <div key={index} className="pending-leave-item">
                            <div className="leave-user">
                              <span className="status-indicator pending"></span>
                              {leave.email.split('@')[0]}
                            </div>
                            <span className="leave-type">{leave.leaveType}</span>
                            <div className="leave-date">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                    ) : (
                      <p>No Pending Leave Requests</p>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeSection === 'history' && (
            <div className="history-section">
              <h3>Leave Request History</h3>
              <div className="history-list">
                {leaveHistory.length > 0 ? (
                  leaveHistory.map((leave, index) => (
                    <Card hoverable className="history-card" key={index}>
                      <p>
                        <span className={`status-indicator ${leave.status}`}></span>
                        <b>Status:</b> <span className={`status-${leave.status}`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </p>
                      <p><b>Type:</b> {leave.leaveType}</p>
                      <p><b>From:</b> {new Date(leave.startDate).toLocaleDateString()}</p>
                      <p><b>To:</b> {new Date(leave.endDate).toLocaleDateString()}</p>
                      <p><b>Reason:</b> {leave.reason}</p>
                    </Card>
                  ))
                ) : (
                  <Card>No leave history found</Card>
                )}
              </div>
            </div>
          )}

          <Modal title="Request Time Off" open={modalVisible} onCancel={handleCancel} footer={null}>
            <Form form={leaveForm} onFinish={handleLeaveSubmit}>
              <Form.Item
                name="leaveType"
                rules={[{ required: true, message: 'Please select leave type' }]}
              >
                <Select placeholder="Select Leave Type">
                  <Option value="casual">Casual Leave</Option>
                  <Option value="sick">Sick Leave</Option>
                  <Option value="earned">Earned Leave</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dateRange"
                rules={[{ required: true, message: 'Please select date range' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="reason"
                rules={[{ required: true, message: 'Please enter reason for leave' }]}
              >
                <Input.TextArea rows={3} placeholder="Enter reason for leave" />
              </Form.Item>

              <Button type="primary" htmlType="submit" block>
                Submit Request
              </Button>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeDashboard;