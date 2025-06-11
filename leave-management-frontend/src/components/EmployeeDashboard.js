// EmployeeDashboard.js
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Card, Progress, DatePicker, Select, Modal, Input } from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  CalendarOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // Track active section

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'employee' && user.role !== 'manager') {
      navigate('/');
    }
  }, [navigate]);

  const showModal = () => setModalVisible(true);
  const handleCancel = () => setModalVisible(false);

  return (
    <Layout className="dashboard-layout">
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo">ACQUIS</div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          onClick={(e) => setActiveSection(e.key)} // Update active section on menu click
        >
          <Menu.Item key="dashboard" icon={<UserOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="history" icon={<HistoryOutlined />}>History</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="dashboard-header">
          <div className="header-left">Welcome back, Employee 👋</div>
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
                  <p>On Leave: 0</p>
                  <p>Today</p>
                </Card>

                <Card title="Leave Requests" hoverable className="dashboard-card" extra={<CalendarOutlined />}>
                  <p>No Leave Requests!!</p>
                </Card>
              </div>
            </>
          )}

          {activeSection === 'history' && (
            <div className="history-section">
              <h3>History</h3>
              <div className="history-list">
                <Card hoverable className="history-card">
                  <p>Casual Leave</p>
                  <p>From: 2023-10-01 To: 2023-10-03</p>
                  <p>Status: Approved</p>
                </Card>
                <Card hoverable className="history-card">
                  <p>Sick Leave</p>
                  <p>From: 2023-09-15 To: 2023-09-16</p>
                  <p>Status: Rejected</p>
                </Card>
              </div>
            </div>
          )}

          <Modal title="Request Time Off" open={modalVisible} onCancel={handleCancel} footer={null}>
            <p><b>Type</b></p>
            <Select placeholder="Select Leave Type" style={{ width: '100%' }}>
              <Option value="casual">Casual Leave</Option>
              <Option value="sick">Sick Leave</Option>
              <Option value="earned">Earned Leave</Option>
            </Select>

            <p style={{ marginTop: '1rem' }}><b>Start Date - End Date</b></p>
            <RangePicker style={{ width: '100%' }} />

            <p style={{ marginTop: '1rem' }}><b>Reason</b></p>
            <Input.TextArea rows={3} placeholder="Enter reason for leave" />

            <Button type="primary" block style={{ marginTop: '1rem' }} onClick={handleCancel}>Done</Button>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeDashboard;