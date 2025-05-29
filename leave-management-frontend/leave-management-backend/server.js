const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Store OTPs temporarily (in production, use a database)
const otpStore = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Use port 465 for SSL
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Debugging: Log email credentials
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS ? 'Present' : 'Missing');

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take messages:', success);
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();

    // Store OTP
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Login OTP for Leave Management System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <h2 style="color: #4c6bc5;">Leave Management System</h2>
          <p>Your OTP for login is:</p>
          <h1 style="color: #4c6bc5; font-size: 32px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p style="color: #666;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const storedOTPData = otpStore.get(email);

  if (!storedOTPData) {
    return res.status(400).json({ success: false, message: 'OTP expired or not found' });
  }

  // Check OTP expiration (5 minutes)
  if (Date.now() - storedOTPData.timestamp > 5 * 60 * 1000) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  // Verify OTP
  if (storedOTPData.otp === otp) {
    otpStore.delete(email);

    // Mock role detection based on email
    const role = email.includes('manager') ? 'manager' : 'employee';

    return res.json({ success: true, message: 'OTP verified successfully', role });
  }

  // Handle incorrect OTP
  storedOTPData.attempts += 1;
  if (storedOTPData.attempts >= 3) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: 'Too many incorrect attempts' });
  }

  return res.status(400).json({ success: false, message: 'Invalid OTP' });
});

// Add this test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
