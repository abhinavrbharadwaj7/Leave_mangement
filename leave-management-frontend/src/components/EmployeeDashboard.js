import React, { useState } from 'react';
import { Tabs, Button, Form, Input, DatePicker, Select, Table, Tag, Card, Row, Col, Typography, notification } from 'antd';
import { PlusOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './EmployeeDashboard.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const EmployeeDashboard = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    sick: 5,
    vacation: 10,
    casual: 7,
    wfh: 3
  });

  const handleApplyLeave = (values) => {
    const [startDate, endDate] = values.dates;
    const newApplication = {
      key: leaveApplications.length + 1,
      type: values.type,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      reason: values.reason,
      status: 'Pending'
    };

    setLeaveApplications([...leaveApplications, newApplication]);
    notification.success({
      message: 'Leave Application Submitted',
      description: 'Your leave application has been submitted for approval.',
    });
  };

  const columns = [
    {
      title: 'Leave Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate'
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate'
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  return (
    <div className="employee-dashboard">
      <Title level={2} className="dashboard-title">
        Welcome to Your Dashboard
      </Title>
      <Tabs defaultActiveKey="1" centered>
        {/* Apply for Leave Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <PlusOutlined />
              Apply for Leave
            </span>
          }
          key="1"
        >
          <Card className="dashboard-card">
            <Form layout="vertical" onFinish={handleApplyLeave}>
              <Form.Item
                name="type"
                label="Leave Type"
                rules={[{ required: true, message: 'Please select a leave type!' }]}
              >
                <Select placeholder="Select leave type">
                  <Option value="sick">Sick</Option>
                  <Option value="vacation">Vacation</Option>
                  <Option value="casual">Casual</Option>
                  <Option value="wfh">Work From Home</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="dates"
                label="Leave Dates"
                rules={[{ required: true, message: 'Please select leave dates!' }]}
              >
                <RangePicker />
              </Form.Item>
              <Form.Item
                name="reason"
                label="Reason for Leave"
                rules={[{ required: true, message: 'Please provide a reason!' }]}
              >
                <Input.TextArea rows={4} placeholder="Enter reason for leave" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit Application
              </Button>
            </Form>
          </Card>
        </Tabs.TabPane>

        {/* View Leave Status Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <CalendarOutlined />
              View Leave Status
            </span>
          }
          key="2"
        >
          <Card className="dashboard-card">
            <Table columns={columns} dataSource={leaveApplications} pagination={{ pageSize: 5 }} />
          </Card>
        </Tabs.TabPane>

        {/* Leave Balance Tracker Tab */}
        <Tabs.TabPane
          tab={
            <span>
              <CheckCircleOutlined />
              Leave Balance Tracker
            </span>
          }
          key="3"
        >
          <Row gutter={[16, 16]}>
            {Object.entries(leaveBalance).map(([type, balance]) => (
              <Col xs={24} sm={12} md={6} key={type}>
                <Card className="leave-balance-card" hoverable>
                  <Title level={4} className="leave-type">
                    {type.charAt(0).toUpperCase() + type.slice(1)} Leave
                  </Title>
                  <Text className="leave-balance-text">Available: {balance}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default EmployeeDashboard;
