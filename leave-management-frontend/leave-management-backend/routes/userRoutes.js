const express = require('express');
const router = express.Router();
const User = require('../models/User');
const transporter = require('../config/emailConfig');
const LeaveRequest = require('../models/LeaveRequest'); // Make sure this is at the top

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Generating OTP for:', email);

    // Find the user by email first
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for OTP:', email);
      return res.status(404).json({ success: false, message: 'User not registered. Please contact admin.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);

    // Save OTP to the existing user document FIRST
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    console.log('Saving OTP to user:', user.email, user.otp);
    await user.save();
    console.log('User saved with OTP:', user.email, user.otp);

    // THEN send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Login OTP for Leave Management System',
      html: `
        <h1>Your OTP for Login</h1>
        <p>Your One Time Password is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');

    res.json({ 
      success: true, 
      message: 'OTP sent successfully'
      // Do NOT send the OTP in the response in production!
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Verifying OTP:', { email, otp });

    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      console.log('User or OTP not found for verification:', email);
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    console.log('Stored OTP:', user.otp.code);
    console.log('OTP Expiry:', user.otp.expiresAt, 'Current Time:', new Date());
    console.log('Comparing OTPs:', user.otp.code, 'vs', otp);
    console.log('Is OTP expired?', user.otp.expiresAt <= new Date());

    if (user.otp.code === otp && user.otp.expiresAt > new Date()) {
      // Clear OTP after successful verification
      user.otp = undefined;
      await user.save();
      console.log('OTP verified successfully for:', email);
      res.json({
        success: true,
        role: user.role || 'Not Assigned',
        department: user.department || 'Not Assigned',
        manager: user.manager || 'Not Assigned'
      });
    } else {
      console.log('OTP verification failed for:', email, 'Reason:', user.otp.code !== otp ? 'OTP mismatch' : 'OTP expired');
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save user details after role selection
router.post('/save-user-details', async (req, res) => {
  try {
    const { email, role, department } = req.body;
    console.log('Saving user details:', { email, role, department }); // Debug log

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    user.department = department;
    await user.save();

    res.json({ success: true, message: 'User details saved successfully' });
  } catch (error) {
    console.error('Error in save-user-details:', error); // Debug log
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user details
router.post('/update-user-details', async (req, res) => {
  try {
    const { email, role, department } = req.body;
    console.log('Updating user details:', { email, role, department });

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update the user's role and department
    user.role = role;
    user.department = department;
    user.isVerified = true;
    await user.save();

    console.log('User updated successfully:', user);

    res.json({
      success: true,
      message: 'User details updated successfully',
      user: {
        email: user.email,
        role: user.role,
        department: user.department,
        manager: user.manager
      }
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user details'
    });
  }
});

// Add all leave requests route
router.get('/all-leave-requests', async (req, res) => {
  try {
    // Get all leave requests
    const leaveRequests = await LeaveRequest.find({}).sort({ startDate: 1 });
    // Get all users (for mapping email to department)
    const users = await User.find({}).select('email department');
    // Debug log
    console.log('Users:', users);
    console.log('LeaveRequests:', leaveRequests);
    // Map user info to leave requests
    const leaveRequestsWithUser = leaveRequests.map(lr => {
      const user = users.find(u => u.email === lr.email);
      return {
        ...lr.toObject(),
        employeeEmail: lr.email || '',
        department: user && user.department ? user.department : '',
      };
    });
    res.json({
      success: true,
      leaveRequests: leaveRequestsWithUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests'
    });
  }
});

// Add user's leave requests route
router.get('/leave-requests/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const leaveRequests = await LeaveRequest.find({ email })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      leaveRequests
    });
  } catch (error) {
    console.error('Error fetching user leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests'
    });
  }
});

// Create leave request (employee)
router.post('/leave-request', async (req, res) => {
  try {
    const { email, leaveType, startDate, endDate, reason } = req.body;
    const user = await User.findOne({ email });
    const manager = user?.manager || ''; // get manager from user profile

    const leaveRequest = new LeaveRequest({
      email,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'pending',
      manager
    });

    await leaveRequest.save();
    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave request'
    });
  }
});

// Manager approve/reject leave request with comment
router.post('/leave-request-action', async (req, res) => {
  try {
    const { id, status, comment } = req.body;
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    leaveRequest.status = status;
    leaveRequest.managerComment = comment || '';
    await leaveRequest.save();
    res.json({ success: true, message: `Leave request ${status}` });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ success: false, message: 'Action failed' });
  }
});

// Manager dashboard: fetch only their team's requests
router.get('/manager-leave-requests/:managerEmail', async (req, res) => {
  try {
    const { managerEmail } = req.params;
    const leaveRequests = await LeaveRequest.find({ manager: managerEmail }).sort({ startDate: 1 });
    res.json({ success: true, leaveRequests });
  } catch (error) {
    console.error('Error fetching manager leave requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
});

// Get team members for a manager
router.get('/team-members/:managerEmail', async (req, res) => {
  try {
    const { managerEmail } = req.params;
    
    // Verify if the requester is actually a manager
    const manager = await User.findOne({ 
      email: managerEmail,
      role: 'manager'
    });

    if (!manager) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Not a manager' 
      });
    }

    const teamMembers = await User.find({ 
      manager: managerEmail 
    }).select('-otp -__v'); // Exclude sensitive fields

    res.json({ 
      success: true, 
      teamMembers,
      count: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch team members' 
    });
  }
});

// Get combined manager dashboard data
router.get('/manager-dashboard/:managerEmail', async (req, res) => {
  try {
    const { managerEmail } = req.params;

    // Get manager details
    const manager = await User.findOne({ 
      email: managerEmail,
      role: 'manager' 
    });

    if (!manager) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Not a manager'
      });
    }

    // Get all employees who report to this manager
    const teamMembers = await User.find({ 
      role: 'employee',
      manager: managerEmail
    }).select('email role department');

    // Get leave requests for these employees
    const leaveRequests = await LeaveRequest.find({
      email: { $in: teamMembers.map(member => member.email) }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        manager,
        teamMembers,
        leaveRequests,
        stats: {
          totalTeamMembers: teamMembers.length,
          pendingRequests: leaveRequests.filter(req => req.status === 'pending').length,
          onLeave: leaveRequests.filter(req => 
            req.status === 'approved' &&
            new Date(req.startDate) <= new Date() &&
            new Date(req.endDate) >= new Date()
          ).length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching manager dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manager dashboard data'
    });
  }
});

// Escalate leave request: approve on escalation
router.post('/escalate-leave-request', async (req, res) => {
  try {
    const { id } = req.body;
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    leaveRequest.status = 'approved'; // Approve the leave
    await leaveRequest.save();
    res.json({ success: true, message: 'Request escalated and approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Escalation failed' });
  }
});

// Get all employees and managers
router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ['employee', 'manager'] }
    }).select('-otp -__v'); // Exclude sensitive fields
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get latest leave applications (limit 5)
router.get('/latest-leave-applications', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    const users = await User.find({}).select('email department');
    const leaveRequestsWithUser = leaveRequests.map(lr => {
      const user = users.find(u => u.email === lr.email);
      return {
        ...lr.toObject(),
        employeeEmail: lr.email || '',
        department: user && user.department ? user.department : '',
      };
    });
    res.json({
      success: true,
      leaveRequests: leaveRequestsWithUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest leave applications'
    });
  }
});

module.exports = router;