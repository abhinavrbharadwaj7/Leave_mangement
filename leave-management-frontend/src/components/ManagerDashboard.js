import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Spin, Modal, Input, Tooltip, Calendar, Badge } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const formatDepartment = (dept) => {
  return dept.charAt(0).toUpperCase() + dept.slice(1);
};

const ManagerDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentModal, setCommentModal] = useState({ visible: false, id: null, action: null });
  const [comment, setComment] = useState('');
  const [team, setTeam] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [managerData, setManagerData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState([]); // New state for employee details
  const navigate = useNavigate();

  // Format employee data
  const formatEmployeeData = (employee) => {
    return {
      name: employee.email.split('@')[0],
      email: employee.email,
      role: employee.role,
      department: employee.department,
      status: employee.status
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.email) return;

      const response = await axios.get(`${BACKEND_URL}/api/manager-dashboard/${userData.email}`);
      if (response.data.success) {
        const { manager, teamMembers, leaveRequests, stats } = response.data.data;
        setManagerData(manager);

        // Format and set employee details
        const formattedEmployees = teamMembers.map(employee => formatEmployeeData(employee));
        setEmployeeDetails(formattedEmployees);

        setTeamMembers(teamMembers);
        setLeaveRequests(leaveRequests);
        setCalendarData(leaveRequests);
        setTeam(teamMembers); // Update team state
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave requests and team info
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Approve/Reject with comment
  const handleAction = (id, status) => {
    setComment('');
    setCommentModal({ visible: true, id, action: status });
  };

  const handleCommentSubmit = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/leave-request-action`, {
        id: commentModal.id,
        status: commentModal.action,
        comment,
      });
      message.success(`Leave request ${commentModal.action}`);
      setCommentModal({ visible: false, id: null, action: null });
      fetchDashboardData();
    } catch {
      message.error('Action failed');
    }
  };

  // Escalate to HR/Admin
  const handleEscalate = async (id) => {
    try {
      await axios.post(`${BACKEND_URL}/api/escalate-leave-request`, { id });
      message.success('Request escalated to HR/Admin');
    } catch {
      message.error('Escalation failed');
    }
  };

  // Calendar cell render for leave events
  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const events = calendarData.filter(
      req =>
        new Date(req.startDate) <= value.toDate() &&
        new Date(req.endDate) >= value.toDate() &&
        req.status === 'approved'
    );
    return (
      <ul className="events">
        {events.map((item, idx) => (
          <li key={idx}>
            <Badge status="success" text={`${item.email.split('@')[0]} (${item.leaveType})`} />
          </li>
        ))}
      </ul>
    );
  };

  // Overlap detection (for pending requests)
  const isOverlapping = (record) => {
    if (record.status !== 'pending') return false;
    return leaveRequests.some(
      req =>
        req.status === 'approved' &&
        req.email !== record.email &&
        (
          (new Date(record.startDate) <= new Date(req.endDate) && new Date(record.startDate) >= new Date(req.startDate)) ||
          (new Date(record.endDate) <= new Date(req.endDate) && new Date(record.endDate) >= new Date(req.startDate))
        )
    );
  };

  const columns = [
    { title: 'Employee', dataIndex: 'email', key: 'email' },
    { title: 'Type', dataIndex: 'leaveType', key: 'leaveType' },
    { title: 'From', dataIndex: 'startDate', key: 'startDate', render: d => new Date(d).toLocaleDateString() },
    { title: 'To', dataIndex: 'endDate', key: 'endDate', render: d => new Date(d).toLocaleDateString() },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'default';
        if (status === 'approved') color = 'green';
        else if (status === 'rejected') color = 'red';
        else if (status === 'pending') color = 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        record.status === 'pending' ? (
          <>
            <Tooltip title={isOverlapping(record) ? "Overlaps with another approved leave" : ""}>
              <Button
                type="primary"
                size="small"
                className="custom-approve-btn"
                onClick={() => handleAction(record._id, 'approved')}
                style={{ marginRight: 8 }}
              >
                Approve
              </Button>
            </Tooltip>
            <Button danger size="small" onClick={() => handleAction(record._id, 'rejected')} style={{ marginRight: 8 }}>
              Reject
            </Button>
            <Button size="small" onClick={() => handleEscalate(record._id)}>
              Escalate
            </Button>
          </>
        ) : null
    }
  ];

  // Update team columns to use formatted employee data
  const teamColumns = [
    { 
      title: 'Name', 
      key: 'name',
      render: (_, record) => (
        <span className="employee-name">
          {record.email.split('@')[0]}
        </span>
      )
    },
    { 
      title: 'Department', 
      key: 'department',
      render: (_, record) => (
        <Tag color="purple">{formatDepartment(record.department)}</Tag>
      )
    },
    { 
      title: 'Role', 
      key: 'role',
      render: (_, record) => (
        <Tag color={record.role === 'employee' ? 'blue' : 'green'}>
          {record.role}
        </Tag>
      )
    },
    { 
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const hasActiveLeave = leaveRequests.some(leave => 
          leave.email === record.email && 
          leave.status === 'approved' &&
          new Date(leave.startDate) <= new Date() &&
          new Date(leave.endDate) >= new Date()
        );

        return (
          <div className="employee-status">
            <Tag color={hasActiveLeave ? 'red' : 'green'}>
              {hasActiveLeave ? 'On Leave' : 'Available'}
            </Tag>
          </div>
        );
      }
    }
  ];

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Manager Dashboard</h1>
            {managerData && (
              <div className="manager-details">
                <span className="manager-name">
                  {managerData.email.split('@')[0]}
                </span>
                <Tag color="blue">{formatDepartment(managerData.department)}</Tag>
              </div>
            )}
          </div>
          {/* Add button to top right */}
          <div style={{ marginLeft: 'auto' }}>
            <Button
              type="primary"
              style={{ background: '#1976d2', borderColor: '#1976d2' }}
              onClick={() => navigate('/employee-dashboard')}
            >
              Go to MyDashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Add Team Overview Section */}
      <div className="team-overview">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Pending Requests</div>
            <div className="stat-value">
              {leaveRequests.filter(req => req.status === 'pending').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Team Members on Leave</div>
            <div className="stat-value">
              {leaveRequests.filter(req => req.status === 'approved').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Team Size</div>
            <div className="stat-value">{team.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Leave Requests Today</div>
            <div className="stat-value">
              {leaveRequests.filter(req => 
                new Date(req.startDate).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Team Members</div>
            <div className="stat-value">{teamMembers.length}</div>
          </div>
        </div>
      </div>

      <div className="leave-table">
        <h2>Leave Requests</h2>
        <Spin spinning={loading}>
          <Table 
            columns={columns}
            dataSource={leaveRequests}
            rowKey="_id"
            pagination={{ pageSize: 8 }}
          />
        </Spin>
      </div>

      <div className="calendar-section">
        <h2>Team Leave Calendar</h2>
        <div className="mini-calendar">
          <Calendar 
            dateCellRender={dateCellRender}
            mode="month"
            fullscreen={false}
          />
        </div>
      </div>

      {/* Update Team Members Table */}
      <div className="team-section">
        <h2>Team Members</h2>
        <Table
          columns={teamColumns}
          dataSource={employeeDetails}
          rowKey="email"
          pagination={false}
          loading={loading}
        />
      </div>

      <Modal
        title={`Add Comment for ${commentModal.action === 'approved' ? 'Approval' : 'Rejection'}`}
        open={commentModal.visible}
        onOk={handleCommentSubmit}
        onCancel={() => setCommentModal({ visible: false, id: null, action: null })}
        okText={commentModal.action === 'approved' ? 'Approve' : 'Reject'}
      >
        <Input.TextArea
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
        />
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
