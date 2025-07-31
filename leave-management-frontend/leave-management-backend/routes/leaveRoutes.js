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

// Update a leave request
router.put('/leave-request/:id', async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { leaveType, startDate, endDate, reason },
      { new: true, runValidators: true }
    );
    if (!leaveRequest) return res.status(404).json({ success: false, message: 'Leave request not found' });
    res.json({ success: true, leaveRequest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete a leave request
router.delete('/leave-request/:id', async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findByIdAndDelete(req.params.id);
    if (!leaveRequest) return res.status(404).json({ success: false, message: 'Leave request not found' });
    res.json({ success: true, message: 'Leave request deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router; 