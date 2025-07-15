const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');

// Get all leave requests
router.get('/all-leave-requests', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find().populate('employeeId', 'email department');
    res.json({ success: true, leaveRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve a leave request
router.post('/leave-request/:id/approve', async (req, res) => {
  try {
    await LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'Approved' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject a leave request
router.post('/leave-request/:id/reject', async (req, res) => {
  try {
    await LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'Rejected' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router; 