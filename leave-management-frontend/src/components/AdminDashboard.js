import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Card, Row, Col, Table, Typography, Button, Badge, Modal, Form, Input, message, Select, Divider, InputNumber, Tooltip } from 'antd';
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
  // Add state for employee form
  const [employeeModal, setEmployeeModal] = useState({ visible: false, mode: 'add' });
  const [employeeForm] = Form.useForm();
  // Add this after other state declarations at the top
  const [managers, setManagers] = useState([]);
  // Add these to the existing state declarations
  const [editEmployeeModal, setEditEmployeeModal] = useState({ visible: false, record: null });
  const [editEmployeeForm] = Form.useForm();
  // Add filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);

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
  };

  // Update userColumns definition
  const userColumns = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => name || record.email.split('@')[0].charAt(0).toUpperCase() + record.email.split('@')[0].slice(1)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: phone => phone || 'Not provided'
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
      title: 'Leave Balance',
      key: 'leaveBalance',
      render: (_, record) => {
        console.log('Rendering leave balance for:', record.email, record.leaveBalance);
        
        const leaveBalance = record.leaveBalance || { casual: 0, sick: 0, earned: 0 };
        const totalLeaves = (leaveBalance.casual || 0) + (leaveBalance.sick || 0) + (leaveBalance.earned || 0);
        
        return (
          <Tooltip title={
            <div>
              <div>Casual: {leaveBalance.casual || 0}</div>
              <div>Sick: {leaveBalance.sick || 0}</div>
              <div>Earned: {leaveBalance.earned || 0}</div>
              <div><strong>Total Available: {totalLeaves}</strong></div>
            </div>
          }>
            <Badge 
              count={totalLeaves} 
              overflowCount={99} 
              style={{ backgroundColor: totalLeaves > 0 ? '#52c41a' : '#d9d9d9' }}
              showZero
            />
          </Tooltip>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setEditEmployeeModal({ visible: true, record });
            editEmployeeForm.setFieldsValue({
              email: record.email,
              name: record.name,
              phone: record.phone,
              role: record.role,
              department: record.department,
              manager: record.manager,
              leaveBalance: {
                casual: record.leaveBalance?.casual || 0,
                sick: record.leaveBalance?.sick || 0,
                earned: record.leaveBalance?.earned || 0
              }
            });
          }}
        >
          Edit
        </Button>
      )
    }
  ];

  // Update the fetchUsers function to handle debugging
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/users/all`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Raw response from backend:', response.data); // Debug log
      
      let userData = [];
      if (response.data && Array.isArray(response.data)) {
        userData = response.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        userData = response.data.users;
      } else {
        console.warn('Invalid user data format:', response.data);
        setUsers([]);
        return;
      }

      // Debug log to check leave balance data
      console.log('User data with leave balances:', userData);
      userData.forEach(user => {
        console.log(`${user.email} leave balance:`, user.leaveBalance);
      });

      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error.response || error);
      message.error('Failed to load users. Please check your connection.');
      setUsers([]);
    }
  };

  useEffect(() => {
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
            setFilteredLeaveRequests(applyFilters(requests));
          }
        })
        .catch(err => {
          console.error('Error fetching leave requests:', err);
          message.error('Failed to load leave requests');
        });
    }
  }, [selectedSection, users, statusFilter, leaveTypeFilter]);

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

  // Add filter function
  const applyFilters = (requests) => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (leaveTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.leaveType === leaveTypeFilter);
    }

    return filtered;
  };

  // Clear filters function
  const clearFilters = () => {
    setStatusFilter('all');
    setLeaveTypeFilter('all');
  };

  const handleMenuClick = (e) => {
    setSelectedSection(e.key);
    if (e.key === 'sign-out') {
      setIsSignOutModalVisible(true);
    }
  };

  const location = useLocation();

  // Add this function after other useEffect hooks
  useEffect(() => {
    // Fetch managers when component mounts
    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/users/all`);
        if (response.data.success) {
          const managersList = response.data.users.filter(user => user.role === 'manager');
          setManagers(managersList);
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
        message.error('Failed to load managers');
      }
    };
    
    fetchManagers();
  }, []);

  // Add this after your existing modals
  const EditEmployeeModal = () => (
    <Modal
      title="Edit Employee"
      open={editEmployeeModal.visible}
      onOk={() => {
        editEmployeeForm.validateFields()
          .then(values => {
            axios.put(`${BACKEND_URL}/api/users/${editEmployeeModal.record._id}`, values)
              .then(response => {
                if (response.data.success) {
                  message.success('Employee updated successfully');
                  setEditEmployeeModal({ visible: false, record: null });
                  editEmployeeForm.resetFields();
                  fetchUsers(); // Refresh the users list
                }
              })
              .catch(err => {
                message.error('Failed to update employee');
                console.error(err);
              });
          });
      }}
      onCancel={() => {
        setEditEmployeeModal({ visible: false, record: null });
        editEmployeeForm.resetFields();
      }}
    >
      <Form
        form={editEmployeeForm}
        layout="vertical"
        initialValues={{
          leaveBalance: {
            casual: 12,
            sick: 12,
            earned: 15
          }
        }}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter employee name' }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
          ]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>
        
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select role' }]}
        >
          <Select>
            <Select.Option value="employee">Employee</Select.Option>
            <Select.Option value="manager">Manager</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="department"
          label="Department"
          rules={[{ required: true, message: 'Please select department' }]}
        >
          <Select>
            <Select.Option value="hr">HR</Select.Option>
            <Select.Option value="engineering">Engineering</Select.Option>
            <Select.Option value="sales">Sales</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="manager"
          label="Manager"
          rules={[{ required: editEmployeeForm.getFieldValue('role') === 'employee', message: 'Please select a manager' }]}
          dependencies={['role']}
        >
          <Select
            placeholder="Select a manager"
            disabled={editEmployeeForm.getFieldValue('role') === 'manager'}
            allowClear
          >
            {managers.map(manager => (
              <Select.Option key={manager.email} value={manager.email}>
                {manager.name || manager.email.split('@')[0]} ({manager.department})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider>Leave Balance</Divider>

        <Form.Item
          name={['leaveBalance', 'casual']}
          label="Casual Leave"
          rules={[{ required: true, message: 'Please enter casual leave balance' }]}
        >
          <InputNumber min={0} max={30} />
        </Form.Item>

        <Form.Item
          name={['leaveBalance', 'sick']}
          label="Sick Leave"
          rules={[{ required: true, message: 'Please enter sick leave balance' }]}
        >
          <InputNumber min={0} max={30} />
        </Form.Item>

        <Form.Item
          name={['leaveBalance', 'earned']}
          label="Earned Leave"
          rules={[{ required: true, message: 'Please enter earned leave balance' }]}
        >
          <InputNumber min={0} max={30} />
        </Form.Item>
      </Form>
    </Modal>
  );

  // Add this helper function before the return statement
  const refreshAllData = async () => {
    try {
      // Refresh dashboard data
      if (selectedSection === 'dashboard') {
        const dashboardResponse = await axios.get(`${BACKEND_URL}/api/all-leave-requests`);
        if (dashboardResponse.data.success && Array.isArray(dashboardResponse.data.leaveRequests)) {
          const sorted = [...dashboardResponse.data.leaveRequests]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(request => ({
              ...request,
              key: request._id,
              email: request.email
            }));
          setLatestApplications(sorted);
        }
      }
      
      // Refresh leave management data
      if (selectedSection === 'leave-management') {
        const leaveResponse = await axios.get(`${BACKEND_URL}/api/all-leave-requests`);
        if (leaveResponse.data.success) {
          const requests = leaveResponse.data.leaveRequests.map(request => ({
            ...request,
            key: request._id,
            email: request.email || request.employeeEmail
          }));
          setLeaveRequests(requests);
        }
      }
      
      // Refresh users data (for leave balances)
      await fetchUsers();
      
      console.log('All data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

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
              <Title level={4}>Manage Department</Title>
              <Table
                columns={[
                  { 
                    title: 'Department',
                    dataIndex: 'department',
                    key: 'department',
                    render: dept => dept.charAt(0).toUpperCase() + dept.slice(1)
                  },
                  { 
                    title: 'Employees',
                    dataIndex: 'employees',
                    key: 'employees',
                    render: employees => (
                      <div>
                        {employees.map(email => (
                          <div key={email}>
                            {email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)}
                            <br />
                          </div>
                        ))}
                      </div>
                    )
                  }
                ]}
                dataSource={(() => {
                  const deptMap = {};
                  users.forEach(u => {
                    if (u.department) {
                      if (!deptMap[u.department]) {
                        deptMap[u.department] = {
                          key: u.department,
                          department: u.department,
                          employees: []
                        };
                      }
                      deptMap[u.department].employees.push(u.email);
                    }
                  });
                  return Object.values(deptMap);
                })()}
                pagination={false}
              />
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
              <Title level={4} style={{ color: '#1a223f', marginBottom: 20 }}>Employees & Managers</Title>
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  onClick={() => setEmployeeModal({ visible: true, mode: 'add' })}
                  icon={<PlusOutlined />}
                >
                  Add Employee
                </Button>
              </div>
              <Table 
                columns={userColumns}
                dataSource={users
                  .filter(u => u.role !== 'admin')
                  .map(user => ({
                    key: user._id || user.email,
                    ...user
                  }))}
                locale={{ emptyText: "No employees or managers found" }}
                pagination={false}
              />
            </Card>
          )}
          {selectedSection === 'leave-management' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4}>Leave Management</Title>
                
                {/* Filter Controls */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: '#4c6bc5', fontWeight: 500 }}>Filters:</span>
                  
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 120 }}
                    placeholder="Status"
                  >
                    <Select.Option value="all">All Status</Select.Option>
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="approved">Approved</Select.Option>
                    <Select.Option value="rejected">Rejected</Select.Option>
                  </Select>

                  <Select
                    value={leaveTypeFilter}
                    onChange={setLeaveTypeFilter}
                    style={{ width: 120 }}
                    placeholder="Leave Type"
                  >
                    <Select.Option value="all">All Types</Select.Option>
                    <Select.Option value="casual">Casual</Select.Option>
                    <Select.Option value="sick">Sick</Select.Option>
                    <Select.Option value="earned">Earned</Select.Option>
                  </Select>

                  <Button 
                    onClick={clearFilters}
                    size="small"
                    style={{ color: '#4c6bc5', borderColor: '#4c6bc5' }}
                  >
                    Clear
                  </Button>
                  
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    Showing {filteredLeaveRequests.length} of {leaveRequests.length} requests
                  </div>
                </div>
              </div>
              
              <Table 
                columns={leaveRequestColumns} 
                dataSource={filteredLeaveRequests} 
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`
                }}
              />
            </Card>
          )}
          {/* Comment out the change password section */}
          {/* {selectedSection === 'change-password' && (
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 32, maxWidth: 400 }}>
              <Title level={4}>Change Password</Title>
              <p>Old Password, New Password, Confirm Password, [Change Button]</p>
            </Card>
          )} */}
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
                <p><b>Employee Email:</b> {selectedLeaveRequest.email}</p>
                <p><b>Department:</b> {selectedLeaveRequest.department}</p>
                <p><b>Leave Type:</b> {selectedLeaveRequest.leaveType}</p>
                <p><b>From:</b> {selectedLeaveRequest.startDate ? dayjs(selectedLeaveRequest.startDate).format('YYYY-MM-DD HH:mm') : '-'}</p>
                <p><b>To:</b> {selectedLeaveRequest.endDate ? dayjs(selectedLeaveRequest.endDate).format('YYYY-MM-DD HH:mm') : '-'}</p>
                <p><b>Status:</b> <span style={{ 
                  color: selectedLeaveRequest.status === 'approved' ? '#52c41a' : 
                        selectedLeaveRequest.status === 'rejected' ? '#ff4d4f' : '#faad14',
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}>{selectedLeaveRequest.status}</span></p>
                <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button
                    onClick={() => {
                      setEditModal({ visible: true, record: selectedLeaveRequest });
                      setIsDetailsModalVisible(false);
                      editForm.setFieldsValue({
                        employeeEmail: selectedLeaveRequest.email,
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
                  
                  {/* Approve Button */}
                  {selectedLeaveRequest.status !== 'approved' && (
                    <Button
                      type="primary"
                      style={{ background: '#52c41a', borderColor: '#52c41a' }}
                      loading={false}
                      onClick={async () => {
                        try {
                          console.log('Approving leave request:', selectedLeaveRequest._id);
                          const response = await axios.post(`${BACKEND_URL}/api/leave-request-action`, {
                            id: selectedLeaveRequest._id,
                            status: 'approved',
                            comment: 'Approved by Admin'
                          });
                          
                          console.log('Approve response:', response.data);
                          
                          if (response.data.success) {
                            message.success('Leave request approved successfully');
                            setIsDetailsModalVisible(false);
                            
                            // Update the selected leave request status locally
                            setSelectedLeaveRequest(prev => ({ ...prev, status: 'approved' }));
                            
                            // Refresh all data
                            await refreshAllData();
                          } else {
                            message.error(response.data.message || 'Failed to approve leave request');
                          }
                        } catch (error) {
                          console.error('Error approving leave:', error);
                          message.error(error.response?.data?.message || 'Failed to approve leave request');
                        }
                      }}
                    >
                      Approve
                    </Button>
                  )}
                  
                  {/* Set Pending Button */}
                  {selectedLeaveRequest.status !== 'pending' && (
                    <Button
                      style={{ background: '#faad14', borderColor: '#faad14', color: '#fff' }}
                      loading={false}
                      onClick={async () => {
                        try {
                          console.log('Setting leave request to pending:', selectedLeaveRequest._id);
                          const response = await axios.post(`${BACKEND_URL}/api/leave-request-action`, {
                            id: selectedLeaveRequest._id,
                            status: 'pending',
                            comment: 'Set to pending by Admin'
                          });
                          
                          console.log('Pending response:', response.data);
                          
                          if (response.data.success) {
                            message.success('Leave request set to pending');
                            setIsDetailsModalVisible(false);
                            
                            // Update the selected leave request status locally
                            setSelectedLeaveRequest(prev => ({ ...prev, status: 'pending' }));
                            
                            // Refresh all data
                            await refreshAllData();
                          } else {
                            message.error(response.data.message || 'Failed to set leave request to pending');
                          }
                        } catch (error) {
                          console.error('Error setting leave to pending:', error);
                          message.error(error.response?.data?.message || 'Failed to set leave request to pending');
                        }
                      }}
                    >
                      Set Pending
                    </Button>
                  )}
                  
                  {/* Reject Button */}
                  {selectedLeaveRequest.status !== 'rejected' && (
                    <Button
                      danger
                      loading={false}
                      onClick={async () => {
                        try {
                          console.log('Rejecting leave request:', selectedLeaveRequest._id);
                          const response = await axios.post(`${BACKEND_URL}/api/leave-request-action`, {
                            id: selectedLeaveRequest._id,
                            status: 'rejected',
                            comment: 'Rejected by Admin'
                          });
                          
                          console.log('Reject response:', response.data);
                          
                          if (response.data.success) {
                            message.success('Leave request rejected');
                            setIsDetailsModalVisible(false);
                            
                            // Update the selected leave request status locally
                            setSelectedLeaveRequest(prev => ({ ...prev, status: 'rejected' }));
                            
                            // Refresh all data
                            await refreshAllData();
                          } else {
                            message.error(response.data.message || 'Failed to reject leave request');
                          }
                        } catch (error) {
                          console.error('Error rejecting leave:', error);
                          message.error(error.response?.data?.message || 'Failed to reject leave request');
                        }
                      }}
                    >
                      Reject
                    </Button>
                  )}
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
          {/* Add Employee Modal */}
          <Modal
            title="Add New Employee"
            open={employeeModal.visible}
            onOk={() => {
              console.log('Add Employee - OK button clicked'); // Debug log
              employeeForm.validateFields()
                .then(values => {
                  console.log('Form values:', values); // Debug log
                  
                  // Show loading state
                  message.loading('Creating employee...', 0);
                  
                  axios.post(`${BACKEND_URL}/api/users/create`, values)
                    .then(response => {
                      console.log('Create employee response:', response.data); // Debug log
                      
                      // Hide loading message
                      message.destroy();
                      
                      if (response.data.success) {
                        message.success('Employee added successfully');
                        setEmployeeModal({ visible: false, mode: 'add' });
                        employeeForm.resetFields();
                        // Refresh user list
                        fetchUsers();
                      } else {
                        message.error(response.data.message || 'Failed to add employee');
                      }
                    })
                    .catch(err => {
                      console.error('Create employee error:', err); // Debug log
                      
                      // Hide loading message
                      message.destroy();
                      
                      const errorMessage = err.response?.data?.message || 'Failed to add employee';
                      message.error(errorMessage);
                    });
                })
                .catch(validationError => {
                  console.error('Form validation error:', validationError); // Debug log
                  message.error('Please fill in all required fields correctly');
                });
            }}
            onCancel={() => {
              setEmployeeModal({ visible: false, mode: 'add' });
              employeeForm.resetFields();
            }}
            okText="Create Employee"
            cancelText="Cancel"
          >
            <Form
              form={employeeForm}
              layout="vertical"
              initialValues={{
                leaveBalance: {
                  casual: 12,
                  sick: 12,
                  earned: 15
                }
              }}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter employee email" />
              </Form.Item>

              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter employee name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
              
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  <Select.Option value="employee">Employee</Select.Option>
                  <Select.Option value="manager">Manager</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Select department">
                  <Select.Option value="hr">HR</Select.Option>
                  <Select.Option value="engineering">Engineering</Select.Option>
                  <Select.Option value="sales">Sales</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="manager"
                label="Manager"
                rules={[{ 
                  required: false, // Make this conditional based on role
                  message: 'Please select a manager' 
                }]}
                dependencies={['role']}
              >
                <Select
                  placeholder="Select a manager (optional for managers)"
                  allowClear
                >
                  {managers.map(manager => (
                    <Select.Option key={manager.email} value={manager.email}>
                      {manager.name || manager.email.split('@')[0]} ({manager.department})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider>Leave Balance</Divider>

              <Form.Item
                name={['leaveBalance', 'casual']}
                label="Casual Leave"
                rules={[{ required: true, message: 'Please enter casual leave balance' }]}
              >
                <InputNumber min={0} max={30} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name={['leaveBalance', 'sick']}
                label="Sick Leave"
                rules={[{ required: true, message: 'Please enter sick leave balance' }]}
              >
                <InputNumber min={0} max={30} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name={['leaveBalance', 'earned']}
                label="Earned Leave"
                rules={[{ required: true, message: 'Please enter earned leave balance' }]}
              >
                <InputNumber min={0} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </Modal>
          <EditEmployeeModal />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;

