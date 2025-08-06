const express = require('express');
const router = express.Router();
const User = require('../models/User');
const transporter = require('../config/emailConfig');
const LeaveRequest = require('../models/LeaveRequest'); // Make sure this is at the top

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    console.log('Generating OTP for:', email);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp); // For testing purposes

    // Send email with OTP
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: 'Leave Management Portal - Login Verification',
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Acquis Compliance - Leave Management Portal Access</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%); min-height: 100vh;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%); min-height: 100vh;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <!-- Main Container -->
                    <table width="680" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; max-width: 680px;">
                        <!-- Header with Brand -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%); padding: 40px 40px 30px; text-align: center;">
                                <div style="background-color: rgba(255,255,255,0.15); width: 90px; height: 90px; border-radius: 50%; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                    <img
                                        alt="Acquis Compliance"
                                        src="https://www.acquiscompliance.com/static/brand-logo-20f74545f9b7c6443e60be675812a5cd.png"
                                        height="45px"
                                        style="filter: brightness(0) invert(1);"
                                    />
                                </div>
                                <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    Acquis Compliance
                                </h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0; font-weight: 400;">
                                    Leave Management Portal Access
                                </p>
                            </td>
                        </tr>
                        <!-- Welcome Section -->
                        <tr>
                            <td style="padding: 40px 40px 20px;">
                                <h2 style="color: #1A1A1A; font-size: 24px; margin: 0 0 16px; font-weight: 600; text-align: center;">
                                    Leave Portal Login Code
                                </h2>
                                <p style="color: #1F1F1F; font-size: 16px; line-height: 24px; margin: 0 0 20px; font-weight: 500;">
                                    Dear User,
                                </p>
                                <p style="color: #434343; font-size: 14px; line-height: 22px; margin: 0 0 30px; letter-spacing: 0.3px;">
                                    You are accessing the Leave Management Portal. For security purposes, please use the
                                    <strong style="color: #0077B6;">One-Time Password (OTP)</strong> below to complete your login to the portal.
                                    Please ensure to use it within the next <strong style="color: #E63946;">10 minutes</strong> for authentication.
                                </p>
                            </td>
                        </tr>
                        <!-- OTP Code Section -->
                        <tr>
                            <td style="padding: 0 40px 30px; text-align: center;">
                                <div style="background: linear-gradient(135deg, #F8FDFF 0%, #E6F7FF 100%); border: 2px solid #B3E5FC; border-radius: 12px; padding: 30px; margin: 0 auto; max-width: 320px;">
                                    <p style="color: #0077B6; font-size: 14px; margin: 0 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                        Portal Access Code
                                    </p>
                                    <div style="background-color: white; border: 2px dashed #00B4D8; border-radius: 8px; padding: 25px; margin-bottom: 16px;">
                                        <div style="font-size: 36px; font-weight: 700; color: #0077B6; letter-spacing: 8px; font-family: 'Courier New', monospace; text-align: center;">
                                            ${otp}
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; justify-content: center; color: #E63946; font-size: 14px; font-weight: 600;">
                                        <i class="fa-solid fa-clock" style="margin-right: 8px;"></i>
                                        Expires in 10 minutes
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <!-- Security Instructions -->
                        <tr>
                            <td style="padding: 0 40px 30px;">
                                <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; border-radius: 8px; padding: 20px;">
                                    <div style="display: flex; align-items: flex-start;">
                                        <i class="fa-solid fa-lock" style="color: #F39C12; margin-right: 12px; font-size: 18px;"></i>
                                        <div style="flex: 1;">
                                            <h3 style="color: #856404; font-size: 16px; margin: 0 0 12px; font-weight: 600;">
                                                Leave Portal Security Notice
                                            </h3>
                                            <ul style="color: #6C5701; font-size: 14px; margin: 0; padding-left: 20px; line-height: 20px; list-style-type: disc;">
                                                <li style="margin-bottom: 6px;">Use this code to access your Leave Management Portal</li>
                                                <li style="margin-bottom: 6px;">Never share this code with colleagues or supervisors</li>
                                                <li style="margin-bottom: 6px;">Enter the code on the portal login page within 10 minutes</li>
                                                <li style="margin-bottom: 6px;">Contact IT support if you didn't request portal access</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <!-- Signature -->
                        <tr>
                            <td style="padding: 0 40px 30px;">
                                <p style="color: #434343; font-size: 15px; margin: 0; font-weight: 500; letter-spacing: 0.3px;">
                                    Best regards,<br>
                                    <strong style="color: #0077B6;">Leave Management Team</strong><br>
                                    <span style="color: #6B7280; font-size: 13px;">Acquis Compliance</span>
                                </p>
                            </td>
                        </tr>
                        <!-- Divider -->
                        <tr>
                            <td style="padding: 0 40px;">
                                <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #E5E7EB 50%, transparent 100%);"></div>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 40px; text-align: center; background-color: #F8F9FA;">
                                <p style="color: #6C757D; font-size: 13px; margin: 0 0 12px; font-weight: 500;">
                                    <strong>Note:</strong> This is an automated message for Leave Portal access. Please do not reply.
                                </p>
                                <p style="color: #6C757D; font-size: 13px; margin: 0 0 16px; font-weight: 500;">
                                    <strong>Acquis Compliance</strong> - Glen Allen, VA 23059
                                </p>
                                <div style="margin: 20px 0;">
                                    <a href="#" style="display: inline-block; margin: 0 8px; color: #6C757D; text-decoration: none; font-size: 12px;">Leave Policy</a>
                                    <span style="color: #D1D5DB;">|</span>
                                    <a href="https://portal.acquiscompliance.com/help" style="display: inline-block; margin: 0 8px; color: #6C757D; text-decoration: none; font-size: 12px;">Portal Guide</a>
                                    <span style="color: #D1D5DB;">|</span>
                                    <a href="mailto:support@acquiscompliance.com" style="display: inline-block; margin: 0 8px; color: #6C757D; text-decoration: none; font-size: 12px;">IT Support</a>
                                </div>
                                <p style="color: #ADB5BD; font-size: 12px; margin: 16px 0 0;">
                                    © 2025 Acquis Compliance. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `
};


    // Send email with professional template
    await transporter.sendMail(mailOptions);
    console.log('✅ Professional OTP email sent successfully to:', email);

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
    console.log('✅ User OTP saved successfully');

    res.json({ 
      success: true, 
      message: 'OTP sent successfully! Please check your email for the verification code.',
      // otp: otp // Uncomment only for testing - remove in production
    });
  } catch (error) {
    console.error('❌ Error in send-otp:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to send OTP. Please try again.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please contact support.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'Please enter a valid email address.';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    console.log('OTP Expiry:', user.otp.expiresAt, 'Current Time:', new Date());
    console.log('Comparing OTPs:', user.otp.code, 'vs', otp);
    console.log('Is OTP expired?', user.otp.expiresAt <= new Date());

    if (user.otp.code === otp) {
      if (user.otp.expiresAt > new Date()) {
        // OTP is correct and not expired, allow login
        // You may want to return user role/department here if needed
        return res.json({
          success: true,
          role: user.role,
          department: user.department,
          manager: user.manager
        });
      } else {
        // OTP is correct but expired
        return res.status(400).json({ success: false, message: 'OTP expired' });
      }
    } else {
      // OTP does not match
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
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

// Create leave request (employee)
router.post('/leave-request', async (req, res) => {
  try {
    const { email, leaveType, startDate, endDate, reason, status, manager } = req.body;
    // If status is provided (manager applying as employee), use it, else default to 'pending'
    const leaveStatus = status || 'pending';
    // If manager is provided in body, use it, else get from user profile
    let managerValue = manager;
    if (typeof managerValue === 'undefined') {
      const user = await User.findOne({ email });
      managerValue = user?.manager || '';
    }

    const leaveRequest = new LeaveRequest({
      email,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: leaveStatus,
      manager: managerValue
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

    // Get employees under this manager
    const teamMembers = await User.find({ 
      department: manager.department,
      role: 'employee'  // Only get employees
    }).select('email role department');

    // Get leave requests for team members
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

// Update the route for fetching all users to include leave balance
router.get('/users/all', async (req, res) => {
  try {
    const users = await User.find({})
      .select('email role department manager leaveBalance') // Include leaveBalance in selection
      .sort({ email: 1 });
    
    res.json({
      success: true,
      users: users.map(user => ({
        email: user.email,
        role: user.role || 'Not Assigned',
        department: user.department || 'Not Assigned',
        manager: user.manager || null,
        leaveBalance: user.leaveBalance || {
          casual: 0,
          sick: 0,
          earned: 0
        },
        _id: user._id
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Update the edit employee route to handle leave balance updates
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department, manager, leaveBalance } = req.body;
    
    // Validate required fields
    if (!role || !department) {
      return res.status(400).json({
        success: false,
        message: 'Role and department are required'
      });
    }
    
    // Prepare update object
    const updateData = {
      role,
      department,
      manager: manager || null
    };

    // Include leave balance if provided
    if (leaveBalance) {
      updateData.leaveBalance = {
        casual: leaveBalance.casual || 0,
        sick: leaveBalance.sick || 0,
        earned: leaveBalance.earned || 0
      };
    }
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        manager: updatedUser.manager,
        leaveBalance: updatedUser.leaveBalance
      }
    });
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
});

// Delete employee
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the user first to get their email for cleanup
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    // Optional: Clean up related data (leave requests, etc.)
    // You might want to delete or archive related leave requests
    // await LeaveRequest.deleteMany({ email: user.email });
    
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
});

// Get single employee by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('email role department manager');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role || 'Not Assigned',
        department: user.department || 'Not Assigned',
        manager: user.manager || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
});

module.exports = router;