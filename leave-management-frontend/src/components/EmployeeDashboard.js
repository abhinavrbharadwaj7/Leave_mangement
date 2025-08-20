// EmployeeDashboard.js
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Card, Progress, DatePicker, Select, Modal, Input, Spin, Form, message } from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  CalendarOutlined,
  FileAddOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';
import axios from 'axios';
import dayjs from 'dayjs';

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
  const [isManagerView, setIsManagerView] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editForm] = Form.useForm();
  const [leaveBalance, setLeaveBalance] = useState({
    casual: 0,
    sick: 0,
    earned: 0
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          navigate('/');
          return;
        }
        const user = JSON.parse(userData);
        // If manager navigates to employee dashboard, allow but mark as manager view
        if (user.role === 'manager') {
          setIsManagerView(true);
        } else if (user.role !== 'employee') {
          navigate('/');
          return;
        }
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

  // Add function to fetch leave balance
  const fetchLeaveBalance = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.email) return;

      const response = await axios.get(`${BACKEND_URL}/api/user-balance/${userData.email}`);
      if (response.data.success) {
        setLeaveBalance(response.data.leaveBalance);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
    fetchAllLeaveRequests();
    fetchUserData();
    fetchLeaveBalance(); // Add this
  }, []);

  const handleLeaveSubmit = async (values) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.email) {
        message.error('User data not found. Please login again.');
        return;
      }

      // Calculate leave days for validation
      const startDate = values.dateRange[0];
      const endDate = values.dateRange[1];
      const leaveDays = endDate.diff(startDate, 'day') + 1;

      // Check if user has sufficient balance
      const currentBalance = leaveBalance[values.leaveType] || 0;
      if (currentBalance < leaveDays) {
        message.error(`Insufficient ${values.leaveType} leave balance. Available: ${currentBalance}, Required: ${leaveDays}`);
        return;
      }

      // If manager is applying leave from employee dashboard, set status to 'pending_admin' and manager to empty
      let leavePayload = {
        email: userData.email,
        leaveType: values.leaveType,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason,
      };

      if (isManagerView) {
        leavePayload.status = 'pending_admin';
        leavePayload.manager = ''; // No manager approval, admin only
      } else {
        leavePayload.manager = userData.manager;
      }

      const response = await axios.post(`${BACKEND_URL}/api/leave-request`, leavePayload);

      if (response.data.success) {
        message.success('Leave request submitted successfully');
        setModalVisible(false);
        leaveForm.resetFields();
        fetchLeaveHistory();
        fetchAllLeaveRequests();
        fetchLeaveBalance(); // Refresh balance
      }
    } catch (error) {
      console.error('Leave request error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit leave request. Please try again.';
      message.error(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setEditModalVisible(true);
  };

  const handleDeleteLeave = (leave) => {
    setSelectedLeave(leave);
    setDeleteModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const leaveId = selectedLeave._id || selectedLeave.id;
      const leavePayload = {
        leaveType: values.leaveType,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason,
      };

      const response = await axios.put(`${BACKEND_URL}/api/leave-request/${leaveId}`, leavePayload);

      if (response.data.success) {
        message.success('Leave request updated successfully');
        setEditModalVisible(false);
        editForm.resetFields();
        fetchLeaveHistory();
        fetchAllLeaveRequests();
      }
    } catch (error) {
      console.error('Leave request update error:', error);
      message.error('Failed to update leave request. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const leaveId = selectedLeave._id || selectedLeave.id;
      const response = await axios.delete(`${BACKEND_URL}/api/leave-request/${leaveId}`);

      if (response.data.success) {
        message.success('Leave request deleted successfully');
        setDeleteModalVisible(false);
        fetchLeaveHistory();
        fetchAllLeaveRequests();
      }
    } catch (error) {
      console.error('Leave request delete error:', error);
      message.error('Failed to delete leave request. Please try again.');
    }
  };

  const calculateProgress = (used, total) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
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
        <div style={{ width: '100%', padding: collapsed ? '0' : '16px', marginTop: 'auto' }}>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#ff4d4f',
              color: '#fff',
              border: 'none',
              marginTop: 16,
              borderRadius: 8
            }}
          >
            {!collapsed && 'Logout'}
          </Button>
        </div>
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
                    <Progress 
                      type="dashboard" 
                      percent={calculateProgress(
                        (12 - (leaveBalance.casual || 0)), // Used = Total - Available
                        12
                      )} 
                      strokeColor="magenta" 
                    />
                    <p>Casual Leave</p>
                    <p>Available: {leaveBalance.casual || 0} | Used: {12 - (leaveBalance.casual || 0)} | Total: 12</p>
                  </div>
                  <div>
                    <Progress 
                      type="dashboard" 
                      percent={calculateProgress(
                        (12 - (leaveBalance.sick || 0)),
                        12
                      )} 
                      strokeColor="blue" 
                    />
                    <p>Sick Leave</p>
                    <p>Available: {leaveBalance.sick || 0} | Used: {12 - (leaveBalance.sick || 0)} | Total: 12</p>
                  </div>
                  <div>
                    <Progress 
                      type="dashboard" 
                      percent={calculateProgress(
                        (15 - (leaveBalance.earned || 0)),
                        15
                      )} 
                      strokeColor="green" 
                    />
                    <p>Earned Leave</p>
                    <p>Available: {leaveBalance.earned || 0} | Used: {15 - (leaveBalance.earned || 0)} | Total: 15</p>
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
                    {allLeaveRequests.filter(req => req.status === 'pending' && req.email === userEmail).length > 0 ? (
                      allLeaveRequests
                        .filter(req => req.status === 'pending' && req.email === userEmail)
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
                            <div style={{ marginTop: 6 }}>
                              <b>Status:</b>{' '}
                              <span
                                style={{
                                  color:
                                    leave.status === 'approved'
                                      ? '#52c41a'
                                      : leave.status === 'rejected'
                                      ? '#ff4d4f'
                                      : '#faad14',
                                  fontWeight: 600,
                                  textTransform: 'capitalize'
                                }}
                              >
                                {leave.status}
                              </span>
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                              <Button 
                                size="small" 
                                type="primary" 
                                onClick={() => handleEditLeave(leave)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                danger 
                                onClick={() => handleDeleteLeave(leave)}
                              >
                                Delete
                              </Button>
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
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={current => current && current < dayjs().startOf('day')}
                />
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
            {isManagerView && (
              <div style={{ marginTop: 16, color: '#faad14', fontWeight: 500 }}>
                Note: As a manager, your leave request will be sent directly to the admin for approval.
              </div>
            )}
          </Modal>

          {/* Edit Leave Modal */}
          <Modal 
            title="Edit Leave Request" 
            open={editModalVisible} 
            onCancel={() => {
              setEditModalVisible(false);
              editForm.resetFields();
            }} 
            footer={null}
          >
            <Form 
              form={editForm} 
              onFinish={handleEditSubmit}
              initialValues={{
                leaveType: selectedLeave?.leaveType,
                dateRange: selectedLeave ? [
                  dayjs(selectedLeave.startDate),
                  dayjs(selectedLeave.endDate)
                ] : [],
                reason: selectedLeave?.reason
              }}
            >
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
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={current => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item
                name="reason"
                rules={[{ required: true, message: 'Please enter reason for leave' }]}
              >
                <Input.TextArea rows={3} placeholder="Enter reason for leave" />
              </Form.Item>

              <Button type="primary" htmlType="submit" block>
                Update Request
              </Button>
            </Form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            title="Delete Leave Request"
            open={deleteModalVisible}
            onCancel={() => setDeleteModalVisible(false)}
            onOk={handleDeleteConfirm}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
            centered
          >
            <p>Are you sure you want to delete this leave request?</p>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, marginTop: 12 }}>
              <p><b>Type:</b> {selectedLeave?.leaveType}</p>
              <p><b>From:</b> {selectedLeave ? new Date(selectedLeave.startDate).toLocaleDateString() : ''}</p>
              <p><b>To:</b> {selectedLeave ? new Date(selectedLeave.endDate).toLocaleDateString() : ''}</p>
              <p><b>Reason:</b> {selectedLeave?.reason}</p>
            </div>
            <p style={{ color: '#ff4d4f', fontSize: '14px', marginTop: 12 }}>This action cannot be undone.</p>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeDashboard;