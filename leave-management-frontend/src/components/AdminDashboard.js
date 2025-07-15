import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Card, Row, Col, Table, Typography, Button, Badge, Modal } from 'antd';
import { UserOutlined, DashboardOutlined, ApartmentOutlined, TeamOutlined, KeyOutlined, LogoutOutlined, BellOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './AdminDashboard.css';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const summaryData = [
  { label: 'Total Regd Employee', value: 2 },
  { label: 'Listed Departments', value: 3 },
  { label: 'Listed Leave Type', value: 3 },
  { label: 'Total Leaves', value: 1 },
  { label: 'Approved Leaves', value: 1 },
  { label: 'New Leaves Applications', value: 0 },
];

const latestApplications = [
  {
    key: 1,
    employeeName: 'Rahul Kumar',
    employeeId: '10805121',
    leaveType: 'Casual Leaves',
    postingDate: '2023-08-31 20:36:21',
    status: 'Approved',
  },
];

const columns = [
  {
    title: '#',
    dataIndex: 'key',
    key: 'key',
    render: (text, record, index) => index + 1,
    width: 50,
  },
  {
    title: 'Employee Email',
    dataIndex: 'employeeEmail',
    key: 'employeeEmail',
    render: (text) => text,
  },
  {
    title: 'Leave Type',
    dataIndex: 'leaveType',
    key: 'leaveType',
  },
  {
    title: 'Posting Date',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Badge status={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'processing'} text={status.charAt(0).toUpperCase() + status.slice(1)} />
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: () => <Button type="primary" size="small" disabled>View Details</Button>,
  },
];

const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'department',
    icon: <ApartmentOutlined />,
    label: 'Department',
    children: [
      { key: 'add-department', icon: <PlusOutlined />, label: 'Add Department' },
      { key: 'manage-department', icon: <ProfileOutlined />, label: 'Manage Department' },
    ],
  },
  {
    key: 'leave-type',
    icon: <ProfileOutlined />,
    label: 'Leave Type',
    children: [
      { key: 'add-leave-type', icon: <PlusOutlined />, label: 'Add Leave Type' },
      { key: 'manage-leave-type', icon: <ProfileOutlined />, label: 'Manage Leave Type' },
    ],
  },
  {
    key: 'employees',
    icon: <TeamOutlined />,
    label: 'Employees',
  },
  {
    key: 'leave-management',
    icon: <ProfileOutlined />,
    label: 'Leave Management',
  },
  {
    key: 'change-password',
    icon: <KeyOutlined />,
    label: 'Change Password',
  },
  {
    key: 'sign-out',
    icon: <LogoutOutlined />,
    label: 'Sign Out',
  },
];

const sectionTitles = {
  'dashboard': 'Dashboard',
  'add-department': 'Add Department',
  'manage-department': 'Manage Department',
  'add-leave-type': 'Add Leave Type',
  'manage-leave-type': 'Manage Leave Type',
  'employees': 'Employees',
  'leave-management': 'Leave Management',
  'change-password': 'Change Password',
};

const userColumns = [
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role) => role.charAt(0).toUpperCase() + role.slice(1)
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
  },
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [latestApplications, setLatestApplications] = useState([]);
  const navigate = useNavigate();
  // Add sign out confirmation state
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  useEffect(() => {
    axios.get('http://localhost:3001/api/all-users')
      .then(res => {
        if (res.data.success) setUsers(res.data.users);
      });
  }, []);

  useEffect(() => {
    if (selectedSection === 'dashboard') {
      axios.get('http://localhost:3001/api/latest-leave-applications')
        .then(res => {
          if (res.data.success) setLatestApplications(res.data.leaveRequests);
        });
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedSection === 'leave-management') {
      axios.get('http://localhost:3001/api/all-leave-requests')
        .then(res => {
          if (res.data.success) setLeaveRequests(res.data.leaveRequests);
        });
    }
  }, [selectedSection]);

  const handleApprove = (id) => {
    axios.post(`http://localhost:3001/api/leave-request/${id}/approve`).then(() => {
      setLeaveRequests(prev => prev.map(lr => lr._id === id ? { ...lr, status: 'Approved' } : lr));
    });
  };

  const handleReject = (id) => {
    axios.post(`http://localhost:3001/api/leave-request/${id}/reject`).then(() => {
      setLeaveRequests(prev => prev.map(lr => lr._id === id ? { ...lr, status: 'Rejected' } : lr));
    });
  };

  const leaveRequestColumns = [
    { title: 'Employee Email', dataIndex: 'employeeEmail', key: 'employeeEmail' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Leave Type', dataIndex: 'leaveType', key: 'leaveType' },
    { title: 'From', dataIndex: 'startDate', key: 'startDate', render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'To', dataIndex: 'endDate', key: 'endDate', render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Badge status={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'processing'} text={status} /> },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => handleApprove(record._id)}
            disabled={record.status === 'approved'}
            style={{
              minWidth: 80,
              backgroundColor: '#1890ff',
              color: '#fff',
              opacity: record.status === 'approved' ? 0.5 : 1,
              borderColor: '#1890ff',
              cursor: record.status === 'approved' ? 'not-allowed' : 'pointer'
            }}
          >
            Approve
          </Button>
          <Button danger size="small" onClick={() => handleReject(record._id)} disabled={record.status === 'rejected'} style={{ marginLeft: 8 }}>Reject</Button>
        </>
      ),
    },
  ];

  const handleMenuClick = (e) => {
    setSelectedSection(e.key);
    if (e.key === 'sign-out') {
      setIsSignOutModalVisible(true);
    }
  };

  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh', position: 'relative' }}>
      <Sider width={200} style={{ background: '#1a223f', minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0' }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ background: '#fff', color: '#1a223f' }} />
          <div style={{ color: '#fff', marginTop: 12, fontWeight: 'bold', fontSize: 18 }}>Admin</div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedSection]}
          style={{ background: '#1a223f', border: 'none' }}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ marginLeft: 200, background: '#f4f6fa' }}>
        <Header style={{ background: '#fff', padding: '0 32px 0 0', marginLeft: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <Title level={3} style={{ margin: 0, color: '#1a223f' }}>ACQUIS | ADMIN</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <BellOutlined style={{ fontSize: 22, color: '#1a223f' }} />
            <span style={{ fontSize: 16, color: '#1a223f' }}>Welcome to AQUIS LMS</span>
          </div>
        </Header>
        <Content style={{ margin: '32px', paddingLeft: 0, background: 'transparent', minHeight: 'calc(100vh - 64px)' }}>
          {/* Section switching logic */}
          {selectedSection === 'dashboard' && (
            <>
              <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {summaryData.map((item, idx) => (
                  <Col xs={24} sm={12} md={8} lg={6} xl={4} key={idx}>
                    <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: 32, fontWeight: 700, color: '#1a223f' }}>{item.value}</div>
                      <div style={{ fontSize: 15, color: '#6c7a93', marginTop: 8 }}>{item.label}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Title level={4} style={{ color: '#1a223f', marginBottom: 20 }}>Latest Leave Applications</Title>
                <Table columns={columns} dataSource={latestApplications} pagination={false} rowKey="_id" />
              </Card>
            </>
          )}
          {selectedSection === 'add-department' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32 }}>
              <Title level={4}>Add Department</Title>
              {/* Add Department Form Placeholder */}
              <p>Department Name, Short Name, Code, [ADD Button]</p>
            </Card>
          )}
          {selectedSection === 'manage-department' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32 }}>
              <Title level={4}>Manage Department</Title>
              {/* Manage Department Table Placeholder */}
              <p>Table: Sr No, Department Name, Short Name, Code, Creation Date, Action (Edit/Delete)</p>
            </Card>
          )}
          {selectedSection === 'add-leave-type' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32 }}>
              <Title level={4}>Add Leave Type</Title>
              {/* Add Leave Type Form Placeholder */}
              <p>Leave Type Name, Description, [ADD Button]</p>
            </Card>
          )}
          {selectedSection === 'manage-leave-type' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32 }}>
              <Title level={4}>Manage Leave Type</Title>
              {/* Manage Leave Type Table Placeholder */}
              <p>Table: Leave Type Name, Description, Action (Edit/Delete)</p>
            </Card>
          )}
          {selectedSection === 'employees' && (
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 32 }}>
              <Title level={4} style={{ color: '#1a223f', marginBottom: 20 }}>Employees & Managers</Title>
              <Table columns={userColumns} dataSource={users.filter(u => u.role !== 'admin').map((u, i) => ({...u, key: i}))} pagination={false} />
            </Card>
          )}
          {selectedSection === 'leave-management' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32 }}>
              <Title level={4}>Leave Management</Title>
              <Table columns={leaveRequestColumns} dataSource={leaveRequests} rowKey="_id" />
            </Card>
          )}
          {selectedSection === 'change-password' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32, maxWidth: 400 }}>
              <Title level={4}>Change Password</Title>
              {/* Change Password Form Placeholder */}
              <p>Old Password, New Password, Confirm Password, [Change Button]</p>
            </Card>
          )}
          {/* Remove inline sign-out card, use Modal instead */}
          <Modal
            title="Sign Out"
            open={isSignOutModalVisible}
            onCancel={() => setIsSignOutModalVisible(false)}
            footer={null}
            centered
          >
            <p>Do you want to sign out?</p>
            <Button type="primary" onClick={() => { setIsSignOutModalVisible(false); setTimeout(() => navigate('/'), 500); }}>Yes</Button>
            <Button style={{ marginLeft: 12 }} onClick={() => setIsSignOutModalVisible(false)}>No</Button>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard; 