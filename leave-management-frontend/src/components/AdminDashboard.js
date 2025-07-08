import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Card, Row, Col, Table, Typography, Button, Badge } from 'antd';
import { UserOutlined, DashboardOutlined, ApartmentOutlined, TeamOutlined, KeyOutlined, LogoutOutlined, BellOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './AdminDashboard.css';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

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
    title: 'Employee Name',
    dataIndex: 'employeeName',
    key: 'employeeName',
    render: (text, record) => `${text} (${record.employeeId})`,
  },
  {
    title: 'Leave Type',
    dataIndex: 'leaveType',
    key: 'leaveType',
  },
  {
    title: 'Posting Date',
    dataIndex: 'postingDate',
    key: 'postingDate',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Badge status={status === 'Approved' ? 'success' : 'processing'} text={status} />
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: () => <Button type="primary" size="small">View Details</Button>,
  },
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  useEffect(() => {
    axios.get('http://localhost:3001/api/all-users')
      .then(res => {
        if (res.data.success) setUsers(res.data.users);
      });
  }, []);

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

  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ background: '#1a223f', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0' }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ background: '#fff', color: '#1a223f' }} />
          <div style={{ color: '#fff', marginTop: 12, fontWeight: 'bold', fontSize: 18 }}>Admin</div>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedSection]} style={{ background: '#1a223f', border: 'none' }}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => setSelectedSection('dashboard')}>
            Dashboard
          </Menu.Item>
          <Menu.SubMenu key="department" icon={<ApartmentOutlined />} title="Department">
            <Menu.Item key="add-department" icon={<PlusOutlined />}>Add Department</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="leave-type" icon={<ProfileOutlined />}>Leave Type</Menu.Item>
          <Menu.Item key="employees" icon={<TeamOutlined />} onClick={() => setSelectedSection('employees')}>
            Employees
          </Menu.Item>
          <Menu.Item key="leave-management" icon={<ProfileOutlined />}>Leave Management</Menu.Item>
          <Menu.Item key="change-password" icon={<KeyOutlined />}>Change Password</Menu.Item>
          <Menu.Item key="sign-out" icon={<LogoutOutlined />}>Sign Out</Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ background: '#f4f6fa' }}>
        <Header style={{ background: '#fff', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <Title level={3} style={{ margin: 0, color: '#1a223f' }}>ACQUIS | ADMIN</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <BellOutlined style={{ fontSize: 22, color: '#1a223f' }} />
            <span style={{ fontSize: 16, color: '#1a223f' }}>Welcome to AQUIS LMS</span>
          </div>
        </Header>
        <Content style={{ margin: '32px', marginLeft: 0, paddingLeft: 32, background: 'transparent', minHeight: 'calc(100vh - 64px)' }}>
          {selectedSection === 'employees' ? (
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 32 }}>
              <Title level={4} style={{ color: '#1a223f', marginBottom: 20 }}>Employees & Managers</Title>
              <Table columns={userColumns} dataSource={users.filter(u => u.role !== 'admin').map((u, i) => ({...u, key: i}))} pagination={false} />
            </Card>
          ) : (
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
                <Table columns={columns} dataSource={latestApplications} pagination={false} />
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard; 