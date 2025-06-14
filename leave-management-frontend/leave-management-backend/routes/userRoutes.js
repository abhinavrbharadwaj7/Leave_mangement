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

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp); // For testing purposes

    // Send email with OTP
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

    // Save or update user with OTP
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        otp: {
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
        }
      });
    } else {
      user.otp = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      };
    }

    await user.save();
    console.log('User saved with OTP:', user);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: otp // Remove this in production, only for testing
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
      console.log('User or OTP not found');
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    console.log('Stored OTP:', user.otp.code);
    console.log('OTP Expiry:', user.otp.expiresAt);

    if (user.otp.code === otp && user.otp.expiresAt > new Date()) {
      res.json({
        success: true,
        manager: 'John Doe', // Replace with actual manager data
        department: 'Engineering'
      });
    } else {
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
    const leaveRequests = await LeaveRequest.find({})
      .sort({ startDate: 1 });
    console.log('Fetched all leave requests:', leaveRequests.length);
    res.json({
      success: true,
      leaveRequests
    });
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
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

// Add create leave request route
router.post('/leave-request', async (req, res) => {
  try {
    const { email, leaveType, startDate, endDate, reason } = req.body;
    console.log('Creating leave request:', { email, leaveType, startDate, endDate, reason });

    // Log current mongoose connection and collection
    const mongoose = require('mongoose');
    console.log('Mongoose DB:', mongoose.connection.name);
    console.log('LeaveRequest collection:', LeaveRequest.collection.name);

    if (!email || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const leaveRequest = new LeaveRequest({
      email,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'pending'
    });

    await leaveRequest.save();
    console.log('Leave request created successfully:', leaveRequest);

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

module.exports = router;