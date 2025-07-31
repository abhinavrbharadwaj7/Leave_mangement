import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Card, Row, Col, Table, Typography, Button, Badge, Modal, Form, Input, message, Select } from 'antd';
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

const leaveTypesInitial = [
  { key: 'casual', name: 'Casual Leave', description: 'For personal matters or emergencies.' },
  { key: 'sick', name: 'Sick Leave', description: 'For illness or medical needs.' },
  { key: 'earned', name: 'Earned Leave', description: 'For planned vacations or earned time off.' },
];

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [latestApplications, setLatestApplications] = useState([]);
  const navigate = useNavigate();
  // Add sign out confirmation state
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  // NEW: State for leave details modal
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState(leaveTypesInitial);
  // Add this for the Add Leave Type form
  const [form] = Form.useForm();
  // Edit modal state
  const [editModal, setEditModal] = useState({ visible: false, record: null });
  const [editForm] = Form.useForm();
  // Add Department state
  const [departments, setDepartments] = useState([]);
  const [deptForm] = Form.useForm();
  const [deptModal, setDeptModal] = useState({ visible: false, mode: 'add', record: null });
  const [deptDeleteModal, setDeptDeleteModal] = useState({ visible: false, record: null });
  
  // Employee management state
  const [employeeModal, setEmployeeModal] = useState({ visible: false, mode: 'add', record: null });
  const [employeeForm] = Form.useForm();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ visible: false, employee: null });

  // Move columns definition here so it has access to the above state setters
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
      dataIndex: 'email',  // Changed from employeeEmail to email
      key: 'email',
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
        <Badge status={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'processing'} 
        text={status.charAt(0).toUpperCase() + status.slice(1)} />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedLeaveRequest(record);
            setIsDetailsModalVisible(true);
          }}
        >
          View Details
        </Button>
      ),
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

  // Update userColumns definition
  const userColumns = [
    {
      title: 'Employee Name',
      dataIndex: 'email',
      key: 'name',
      render: email => email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: role => role ? (role.charAt(0).toUpperCase() + role.slice(1)) : '-'
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: dept => dept ? (dept.charAt(0).toUpperCase() + dept.slice(1)) : '-'
    }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // If you have auth token
        const response = await axios.get(`${BACKEND_URL}/api/users/all`, {
          headers: {
            'Content-Type': 'application/json',
            // Add auth header if needed
            // 'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          console.warn('Invalid user data format:', response.data);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error.response || error);
        message.error('Failed to load users. Please check your connection.');
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedSection === 'dashboard') {
      axios.get(`${BACKEND_URL}/api/all-leave-requests`)
        .then(res => {
          if (res.data.success && Array.isArray(res.data.leaveRequests)) {
            const sorted = [...res.data.leaveRequests]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map(request => ({
                ...request,
                key: request._id,
                email: request.email  // Make sure email is included
              }));
            setLatestApplications(sorted);
          }
        })
        .catch(err => {
          console.error('Error fetching leave requests:', err);
          message.error('Failed to load latest applications');
        });
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedSection === 'leave-management') {
      axios.get(`${BACKEND_URL}/api/all-leave-requests`)
        .then(res => {
          if (res.data.success) {
            const requests = res.data.leaveRequests.map(request => ({
              ...request,
              key: request._id,
              // Ensure email is set
              email: request.email || request.employeeEmail
            }));
            setLeaveRequests(requests);
          }
        })
        .catch(err => {
          console.error('Error fetching leave requests:', err);
          message.error('Failed to load leave requests');
        });
    }
  }, [selectedSection, users]);

  // Fetch departments when manage-department section is selected
  useEffect(() => {
    if (selectedSection === 'manage-department') {
      axios.get(`${BACKEND_URL}/api/departments`)
        .then(res => {
          if (res.data.success && Array.isArray(res.data.departments)) {
            setDepartments(res.data.departments);
          } else {
            setDepartments([]);
          }
        })
        .catch(err => {
          console.error('Error fetching departments:', err);
          setDepartments([]);
          message.error('Failed to load departments');
        });
    }
  }, [selectedSection]);

  const leaveRequestColumns = [
    { 
      title: 'Employee Email', 
      dataIndex: 'email',  // Changed from employeeEmail to email
      key: 'email'
    },
    { 
      title: 'Department', 
      dataIndex: 'department',
      key: 'department',
      render: (_, record) => {
        const user = users.find(u => u.email === record.email);
        return user?.department || '-';
      }
    },
    { title: 'Leave Type', dataIndex: 'leaveType', key: 'leaveType' },
    { title: 'From', dataIndex: 'startDate', key: 'startDate', render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'To', dataIndex: 'endDate', key: 'endDate', render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Badge status={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'processing'} text={status} /> },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedLeaveRequest(record);
            setIsDetailsModalVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Department CRUD handlers
  const handleAddDepartment = async (values) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/departments`, values);
      if (res.data.success) {
        setDepartments(prev => [...prev, res.data.department]);
        setDeptModal({ visible: false, mode: 'add', record: null });
        deptForm.resetFields();
        message.success('Department added successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add department');
    }
  };

  const handleEditDepartment = async (values) => {
    try {
      const id = deptModal.record._id;
      const res = await axios.put(`${BACKEND_URL}/api/departments/${id}`, values);
      if (res.data.success) {
        setDepartments(prev => prev.map(d => d._id === id ? res.data.department : d));
        setDeptModal({ visible: false, mode: 'add', record: null });
        deptForm.resetFields();
        message.success('Department updated successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async (record) => {
    try {
      const id = record._id;
      const res = await axios.delete(`${BACKEND_URL}/api/departments/${id}`);
      if (res.data.success) {
        setDepartments(prev => prev.filter(d => d._id !== id));
        setDeptDeleteModal({ visible: false, record: null });
        message.success('Department deleted successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  // Employee management functions
  const handleAddEmployee = async (values) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users/create`, values);
      if (response.data.success) {
        setUsers(prev => [...prev, response.data.user]);
        setEmployeeModal({ visible: false, mode: 'add', record: null });
        employeeForm.resetFields();
        message.success('Employee added successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleEditEmployee = async (values) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/users/${employeeModal.record._id}`, values);
      if (response.data.success) {
        setUsers(prev => prev.map(user => 
          user._id === employeeModal.record._id ? { ...user, ...values } : user
        ));
        setEmployeeModal({ visible: false, mode: 'edit', record: null });
        employeeForm.resetFields();
        message.success('Employee updated successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employee) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/users/${employee._id}`);
      if (response.data.success) {
        setUsers(prev => prev.filter(user => user._id !== employee._id));
        setDeleteConfirmModal({ visible: false, employee: null });
        message.success('Employee deleted successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

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
      <Layout style={{ marginLeft: 0, background: '#f4f6fa' }}>
        <Header style={{
          background: '#fff',
          padding: '0 32px 0 0', // Remove left padding
          marginLeft: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 64,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <Title level={3} style={{ margin: 0, color: '#1a223f', marginLeft: '32px' }}>ACQUIS | ADMIN</Title>
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
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32, background: '#f9fbff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <Title level={4}>Add Department</Title>
              <Form
                form={deptForm}
                layout="vertical"
                onFinish={({ name, shortName, code }) => {
                  if (!name || !shortName || !code) {
                    message.error('Please fill all fields');
                    return;
                  }
                  // Check for duplicate
                  if (departments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
                    message.error('Department already exists');
                    return;
                  }
                  setDepartments(prev => [
                    ...prev,
                    { key: code.toLowerCase(), name, shortName, code }
                  ]);
                  message.success('Department added');
                  deptForm.resetFields();
                }}
                style={{ maxWidth: 400 }}
                name="add-department-form"
              >
                <Form.Item name="name" label="Department Name" rules={[{ required: true, message: 'Please enter department name' }]}> 
                  <Input placeholder="Enter department name" />
                </Form.Item>
                <Form.Item name="shortName" label="Short Name" rules={[{ required: true, message: 'Please enter short name' }]}> 
                  <Input placeholder="Enter short name" />
                </Form.Item>
                <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Please enter code' }]}> 
                  <Input placeholder="Enter code" />
                </Form.Item>
                <Form.Item style={{ marginTop: 24 }}>
                  <Button type="primary" htmlType="submit" block style={{ background: '#1890ff', color: '#fff', border: 'none' }}>ADD</Button>
                </Form.Item>
              </Form>
            </Card>
          )}
          {selectedSection === 'manage-department' && (
  <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <Title level={4} style={{ margin: 0 }}>Manage Department</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => {
        setDeptModal({ visible: true, mode: 'add', record: null });
        deptForm.resetFields();
      }}>
        Add Department
      </Button>
    </div>
    <Table
      columns={[
        {
          title: 'Department Name',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
        },
        {
          title: 'Actions',
          key: 'actions',
          render: (text, record) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="small" type="primary" onClick={() => {
                setDeptModal({ visible: true, mode: 'edit', record });
                deptForm.setFieldsValue({ name: record.name, description: record.description });
              }}>Edit</Button>
              <Button size="small" danger onClick={() => {
                setDeptDeleteModal({ visible: true, record });
              }}>Delete</Button>
            </div>
          ),
          width: 120,
        }
      ]}
      dataSource={departments}
      rowKey="_id"
      pagination={false}
    />
    {/* Add/Edit Department Modal */}
    <Modal
      title={deptModal.mode === 'add' ? 'Add Department' : 'Edit Department'}
      open={deptModal.visible}
      onCancel={() => {
        setDeptModal({ visible: false, mode: 'add', record: null });
        deptForm.resetFields();
      }}
      onOk={() => {
        deptForm.validateFields().then(values => {
          if (deptModal.mode === 'add') handleAddDepartment(values);
          else handleEditDepartment(values);
        });
      }}
      okText={deptModal.mode === 'add' ? 'Add' : 'Update'}
      cancelText="Cancel"
    >
      <Form form={deptForm} layout="vertical">
        <Form.Item name="name" label="Department Name" rules={[{ required: true, message: 'Please enter department name' }]}> 
          <Input placeholder="Enter department name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
    {/* Delete Department Modal */}
    <Modal
      title="Delete Department"
      open={deptDeleteModal.visible}
      onCancel={() => setDeptDeleteModal({ visible: false, record: null })}
      onOk={() => handleDeleteDepartment(deptDeleteModal.record)}
      okText="Delete"
      okType="danger"
      cancelText="Cancel"
      centered
    >
      <p>Are you sure you want to delete department <b>{deptDeleteModal.record?.name}</b>?</p>
      <p style={{ color: '#ff4d4f', fontSize: '14px' }}>This action cannot be undone.</p>
    </Modal>
  </Card>
)}
          {selectedSection === 'add-leave-type' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32, background: '#f9fbff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <Title level={4}>Add Leave Type</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={({ name, description }) => {
                  if (!name || !description) {
                    message.error('Please enter both name and description');
                    return;
                  }
                  // Check for duplicate
                  if (leaveTypes.some(lt => lt.name.toLowerCase() === name.toLowerCase())) {
                    message.error('Leave type already exists');
                    return;
                  }
                  setLeaveTypes(prev => [
                    ...prev,
                    { key: name.toLowerCase().replace(/\s+/g, '-'), name, description }
                  ]);
                  message.success('Leave type added');
                  form.resetFields();
                }}
                style={{ maxWidth: 400 }}
                name="add-leave-type-form"
              >
                <Form.Item name="name" label="Leave Type Name" rules={[{ required: true, message: 'Please enter leave type name' }]}> 
                  <Input placeholder="Enter leave type name" />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}> 
                  <Input.TextArea placeholder="Enter description" rows={3} />
                </Form.Item>
                <Form.Item style={{ marginTop: 24 }}>
                  <Button type="primary" htmlType="submit" block style={{ background: '#1890ff', color: '#fff', border: 'none' }}>ADD</Button>
                </Form.Item>
              </Form>
            </Card>
          )}
          {selectedSection === 'manage-leave-type' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32 }}>
              <Title level={4}>Manage Leave Type</Title>
              <Table
                columns={[
                  { title: 'Leave Type Name', dataIndex: 'name', key: 'name' },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                  {
                    title: 'Action',
                    key: 'action',
                    render: (_, record) => (
                      <>
                        <Button size="small" style={{ marginRight: 8 }} onClick={() => {
                          setEditModal({ visible: true, record });
                          editForm.setFieldsValue({ name: record.name, description: record.description });
                        }}>Edit</Button>
                        <Button size="small" danger onClick={() => {
                          Modal.confirm({
                            title: 'Delete Leave Type',
                            content: `Are you sure you want to delete "${record.name}"?`,
                            okText: 'Delete',
                            okType: 'danger',
                            cancelText: 'Cancel',
                            onOk: () => setLeaveTypes(prev => prev.filter(lt => lt.key !== record.key))
                          });
                        }}>Delete</Button>
                      </>
                    )
                  }
                ]}
                dataSource={leaveTypes}
                rowKey="key"
                pagination={false}
              />
              {/* Edit Modal */}
              <Modal
                title="Edit Leave Type"
                open={editModal.visible}
                onCancel={() => setEditModal({ visible: false, record: null })}
                onOk={() => {
                  editForm.validateFields().then(values => {
                    setLeaveTypes(prev => prev.map(lt =>
                      lt.key === editModal.record.key ? { ...lt, name: values.name, description: values.description } : lt
                    ));
                    setEditModal({ visible: false, record: null });
                    message.success('Leave type updated');
                  });
                }}
                okText="Save"
                cancelText="Cancel"
              >
                <Form form={editForm} layout="vertical">
                  <Form.Item name="name" label="Leave Type Name" rules={[{ required: true, message: 'Please enter leave type name' }]}> 
                    <Input />
                  </Form.Item>
                  <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}> 
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Form>
              </Modal>
            </Card>
          )}
          {selectedSection === 'employees' && (
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4} style={{ color: '#1a223f', margin: 0 }}>Employees & Managers</Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEmployeeModal({ visible: true, mode: 'add', record: null });
                    employeeForm.resetFields();
                  }}
                >
                  Add Employee
                </Button>
              </div>
              <Table 
                columns={[
                  {
                    title: '#',
                    dataIndex: 'index',
                    key: 'index',
                    render: (text, record, index) => index + 1,
                    width: 60,
                  },
                  {
                    title: 'Employee Name',
                    dataIndex: 'email',
                    key: 'name',
                    render: email => email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
                  },
                  {
                    title: 'Email',
                    dataIndex: 'email',
                    key: 'email',
                  },
                  {
                    title: 'Role',
                    dataIndex: 'role',
                    key: 'role',
                    render: role => role ? (role.charAt(0).toUpperCase() + role.slice(1)) : '-'
                  },
                  {
                    title: 'Department',
                    dataIndex: 'department',
                    key: 'department',
                    render: dept => dept ? (dept.charAt(0).toUpperCase() + dept.slice(1)) : '-'
                  },
                  {
                    title: 'Manager',
                    dataIndex: 'manager',
                    key: 'manager',
                    render: manager => manager || '-'
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (text, record) => (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button 
                          size="small" 
                          type="primary"
                          onClick={() => {
                            setEmployeeModal({ visible: true, mode: 'edit', record });
                            employeeForm.setFieldsValue({
                              email: record.email,
                              role: record.role,
                              department: record.department,
                              manager: record.manager
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          danger
                          onClick={() => {
                            setDeleteConfirmModal({ visible: true, employee: record });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                    width: 120,
                  }
                ]}
                dataSource={users
                  .filter(u => u.role !== 'admin')
                  .map(user => ({
                    key: user._id || user.email,
                    ...user
                  }))}
                locale={{ emptyText: "No employees or managers found" }}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 800 }}
              />
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
          {/* NEW: Leave Details Modal */}
          <Modal
            title="Leave Request Details"
            open={isDetailsModalVisible}
            onCancel={() => setIsDetailsModalVisible(false)}
            footer={null}
            centered
          >
            {selectedLeaveRequest && (
              <div>
                <p><b>Employee Email:</b> {selectedLeaveRequest.employeeEmail}</p>
                <p><b>Department:</b> {selectedLeaveRequest.department}</p>
                <p><b>Leave Type:</b> {selectedLeaveRequest.leaveType}</p>
                <p><b>From:</b> {selectedLeaveRequest.startDate ? dayjs(selectedLeaveRequest.startDate).format('YYYY-MM-DD HH:mm') : '-'}</p>
                <p><b>To:</b> {selectedLeaveRequest.endDate ? dayjs(selectedLeaveRequest.endDate).format('YYYY-MM-DD HH:mm') : '-'}</p>
                <p><b>Status:</b> {selectedLeaveRequest.status}</p>
                <div style={{ marginTop: 24 }}>
                  <Button
                    style={{ marginLeft: 12 }}
                    onClick={() => {
                      setEditModal({ visible: true, record: selectedLeaveRequest });
                      setIsDetailsModalVisible(false);
                      editForm.setFieldsValue({
                        employeeEmail: selectedLeaveRequest.employeeEmail,
                        department: selectedLeaveRequest.department,
                        leaveType: selectedLeaveRequest.leaveType,
                        startDate: selectedLeaveRequest.startDate ? dayjs(selectedLeaveRequest.startDate) : null,
                        endDate: selectedLeaveRequest.endDate ? dayjs(selectedLeaveRequest.endDate) : null,
                        status: selectedLeaveRequest.status,
                      });
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </Modal>
          {/* Edit Leave Request Modal for Admin */}
          <Modal
            title="Edit Leave Request"
            open={editModal.visible}
            onCancel={() => setEditModal({ visible: false, record: null })}
            onOk={() => {
              editForm.validateFields().then(values => {
                // Prepare payload
                const payload = {
                  ...values,
                  startDate: values.startDate ? values.startDate.toISOString() : null,
                  endDate: values.endDate ? values.endDate.toISOString() : null,
                };
                axios.put(`${BACKEND_URL}/api/leave-request/${editModal.record._id}/admin-edit`, payload)
                  .then(res => {
                    if (res.data.success) {
                      const updatedRequest = { ...editModal.record, ...payload };
                      setLeaveRequests(prev => prev.map(lr =>
                        lr._id === editModal.record._id ? updatedRequest : lr
                      ));
                      setLatestApplications(prev => prev.map(lr =>
                        lr._id === editModal.record._id ? updatedRequest : lr
                      ));
                      message.success('Leave request updated');
                    } else {
                      message.error('Failed to update leave request');
                    }
                    setEditModal({ visible: false, record: null });
                  })
                  .catch(() => {
                    message.error('Failed to update leave request');
                    setEditModal({ visible: false, record: null });
                  });
              });
            }}
            okText="Save"
            cancelText="Cancel"
          >
            <Form form={editForm} layout="vertical">
              <Form.Item name="employeeEmail" label="Employee Email" rules={[{ required: true, message: 'Please enter employee email' }]}> 
                <Input />
              </Form.Item>
              <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please enter department' }]}> 
                <Input />
              </Form.Item>
              <Form.Item name="leaveType" label="Leave Type" rules={[{ required: true, message: 'Please enter leave type' }]}> 
                <Input />
              </Form.Item>
              <Form.Item name="startDate" label="From" rules={[{ required: true, message: 'Please select start date' }]}> 
                <Input type="datetime-local" />
              </Form.Item>
              <Form.Item name="endDate" label="To" rules={[{ required: true, message: 'Please select end date' }]}> 
                <Input type="datetime-local" />
              </Form.Item>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
                <Select>
                  <Select.Option value="approved">Approve</Select.Option>
                  <Select.Option value="rejected">Reject</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
          
          {/* Employee Add/Edit Modal */}
          <Modal
            title={employeeModal.mode === 'add' ? 'Add New Employee' : 'Edit Employee'}
            open={employeeModal.visible}
            onCancel={() => {
              setEmployeeModal({ visible: false, mode: 'add', record: null });
              employeeForm.resetFields();
            }}
            onOk={() => {
              employeeForm.validateFields().then(values => {
                if (employeeModal.mode === 'add') {
                  handleAddEmployee(values);
                } else {
                  handleEditEmployee(values);
                }
              }).catch(error => {
                console.error('Validation failed:', error);
              });
            }}
            okText={employeeModal.mode === 'add' ? 'Add Employee' : 'Update Employee'}
            cancelText="Cancel"
            width={600}
          >
            <Form 
              form={employeeForm} 
              layout="vertical"
              initialValues={{
                role: 'employee',
                department: 'hr'
              }}
            >
              <Form.Item 
                name="email" 
                label="Email Address" 
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input 
                  placeholder="Enter employee email" 
                  disabled={employeeModal.mode === 'edit'}
                />
              </Form.Item>
              
              <Form.Item 
                name="role" 
                label="Role" 
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select placeholder="Select role">
                  <Select.Option value="employee">Employee</Select.Option>
                  <Select.Option value="manager">Manager</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                name="department" 
                label="Department" 
                rules={[{ required: true, message: 'Please select a department' }]}
              >
                <Select placeholder="Select department">
                  <Select.Option value="hr">HR</Select.Option>
                  <Select.Option value="it">IT</Select.Option>
                  <Select.Option value="finance">Finance</Select.Option>
                  <Select.Option value="marketing">Marketing</Select.Option>
                  <Select.Option value="operations">Operations</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                name="manager" 
                label="Manager" 
                rules={[{ required: true, message: 'Please select a manager' }]}
              >
                <Select 
                  placeholder="Select manager" 
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={(value) => {
                    // Auto-fill manager when selected
                    const selectedManager = users.find(user => user.email === value);
                    if (selectedManager && selectedManager.department) {
                      employeeForm.setFieldsValue({ department: selectedManager.department });
                    }
                  }}
                >
                  {users
                    .filter(user => user.role === 'manager')
                    .map(manager => (
                      <Select.Option key={manager._id || manager.email} value={manager.email}>
                        {manager.email.split('@')[0].charAt(0).toUpperCase() + manager.email.split('@')[0].slice(1)} ({manager.department || 'No Dept'}) - {manager.email}
                      </Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </Form>
          </Modal>
          
          {/* Delete Confirmation Modal */}
          <Modal
            title="Delete Employee"
            open={deleteConfirmModal.visible}
            onCancel={() => setDeleteConfirmModal({ visible: false, employee: null })}
            onOk={() => handleDeleteEmployee(deleteConfirmModal.employee)}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
            centered
          >
            <p>
              Are you sure you want to delete employee{' '}
              <strong>
                {deleteConfirmModal.employee?.email?.split('@')[0]?.charAt(0)?.toUpperCase() + 
                 deleteConfirmModal.employee?.email?.split('@')[0]?.slice(1)}
              </strong>{' '}
              ({deleteConfirmModal.employee?.email})?
            </p>
            <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
              This action cannot be undone and will remove all associated data.
            </p>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
