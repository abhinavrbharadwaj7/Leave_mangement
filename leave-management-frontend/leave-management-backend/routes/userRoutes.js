const express = require('express');
const router = express.Router();
const User = require('../models/User');
const transporter = require('../config/emailConfig');

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

module.exports = router;
