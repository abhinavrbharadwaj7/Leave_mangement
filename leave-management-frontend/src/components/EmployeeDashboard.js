import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Typography, Button, Table, Tag, Modal, Form, Input, DatePicker, Select, Progress } from 'antd';
import { DashboardOutlined, HistoryOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import './EmployeeDashboard.css';
import logo from '../assets/unnamed.jpg';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const leaveBalances = [
  { type: 'Casual Leave', available: 3, used: 2, total: 5, color: 'purple' },
  { type: 'Sick Leave', available: 4, used: 1, total: 5, color: 'blue' },
  { type: 'Earned Leave', available: 8, used: 2, total: 10, color: 'green' }
];

const leaveRequests = []; // Example: [{ duration: 'May 10 - May 12', type: 'Casual', days: 3, status: 'Pending' }]

const EmployeeDashboard = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Layout className="employee-dashboard">
      <Sider width={250} className="dashboard-sider">
        <div className="logo">
          <img src={logo} alt="Company Logo" className="logo-image" />
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<HistoryOutlined />}>
            History
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="dashboard-header">
          <Title level={3} style={{ color: '#fff', margin: 0 }}>Welcome back, Employee 👋</Title>
          <Button type="primary" className="request-time-off-btn" onClick={showModal}>
            Request Time Off
          </Button>
        </Header>

        <Content className="dashboard-content">
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Title level={4}>Leave Usage Summary</Title>
            <Row justify="center" gutter={16}>
              {leaveBalances.map((leave) => {
                const usedPercentage = Math.round((leave.used / leave.total) * 100) || 0;
                return (
                  <Col key={leave.type}>
                    <Progress type="circle" percent={usedPercentage} format={percent => `${percent}%`} />
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: leave.color }}>{leave.type}</Text>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>

          <Row gutter={[16, 16]} justify="center">
            {leaveBalances.map((leave) => (
              <Col xs={24} sm={12} md={8} lg={6} key={leave.type}>
                <Card className="leave-balance-card">
                  <Title level={5} style={{ color: leave.color }}>{leave.type}</Title>
                  <Text>Available: {leave.available}</Text><br />
                  <Text>Used: {leave.used}</Text><br />
                  <Text>Total: {leave.total}</Text>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24} md={12}>
              <Card title="Who's on Leave" className="dashboard-card" extra={<UserOutlined />}>
                <Text>On Leave: 0</Text>
                <br />
                <Text>Today</Text>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Leave Requests" className="dashboard-card" extra={<CalendarOutlined />}>
                {leaveRequests.length > 0 ? (
                  <Table
                    dataSource={leaveRequests}
                    columns={[
                      { title: 'Duration', dataIndex: 'duration', key: 'duration' },
                      { title: 'Type', dataIndex: 'type', key: 'type' },
                      { title: 'Days', dataIndex: 'days', key: 'days' },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => (
                          <Tag color={status === 'Approved' ? 'green' : 'orange'}>{status}</Tag>
                        )
                      }
                    ]}
                    pagination={false}
                  />
                ) : (
                  <Text>No Leave Requests!!</Text>
                )}
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>

      <Modal
        title="Request Time Off"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="modern-modal"
      >
        <Form layout="vertical">
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select a leave type!' }]}
          >
            <Select placeholder="Select Leave Type">
              <Option value="casual">Casual Leave</Option>
              <Option value="sick">Sick Leave</Option>
              <Option value="earned">Earned Leave</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dates"
            label="Start Date - End Date"
            rules={[{ required: true, message: 'Please select dates!' }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please provide a reason!' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter reason for leave" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block className="modern-button">
            Done
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default EmployeeDashboard;
