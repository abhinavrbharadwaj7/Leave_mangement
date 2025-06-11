const express = require('express');
const router = express.Router();
const User = require('../models/User');
const transporter = require('../config/emailConfig');

// Send OTP route
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Checking user:', email);

    const isAdminEmail = email === 'rajeshp@acquiscompliance.com';
    let user = await User.findOne({ email });

    // Email Not Found check
    if (!user && !isAdminEmail) {
      console.warn(`Warning: Login attempt with unregistered email: ${email}`);
      return res.status(404).json({
        success: false,
        message: 'This email is not registered. Please contact support or sign up if available.'
      });
    }

    // Generate and save OTP logic
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };

    await user.save();
    console.log('User saved in MongoDB:', JSON.stringify(user, null, 2));

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: isAdminEmail ? 'Admin Login OTP' : 'Login OTP',
      html: `
        <h2>Your Login OTP</h2>
        <p>Your One Time Password is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        ${isAdminEmail ? '<p><strong>You are logging in as an administrator.</strong></p>' : ''}
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error(`Error: Failed to send OTP to ${email}`, emailError);
      return res.status(500).json({
        success: false,
        message: "We couldn't send an OTP to your email. Please try again later."
      });
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error(`Error: Unexpected error during login for email: ${email}`, error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact support.'
    });
  }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    let user = await User.findOne({ email });

    // OTP Validation checks
    if (!user) {
      console.warn(`Warning: Login attempt with unregistered email: ${email}`);
      return res.status(404).json({
        success: false,
        message: 'This email is not registered. Please contact support.'
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    if (user.otp.expiresAt < new Date()) {
      console.info(`Info: Expired OTP entered for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Your OTP has expired. Please request a new one.'
      });
    }

    if (user.otp.code !== otp) {
      console.warn(`Warning: Invalid OTP attempt for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check your email and try again.'
      });
    }

    // Determine user type and role
    const isAdmin = user.role === 'admin';
    
    res.json({
      success: true,
      role: isAdmin ? 'admin' : user.role || 'employee',
      department: user.department || 'Not Assigned',
      manager: user.manager || 'Not Assigned'
    });
  } catch (error) {
    console.error(`Error: Unexpected error during login for email: ${email}`, error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact support.'
    });
  }
});

// Add a route to view all users (for testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;