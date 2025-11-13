const express = require('express');
const router = express.Router();
const LeaveType = require('../models/LeaveType');

// Get all leave types
router.get('/leave-types', async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find();
    res.json({ success: true, leaveTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a leave type
router.post('/leave-type', async (req, res) => {
  try {
    const { name, description } = req.body;
    const leaveType = new LeaveType({ name, description });
    await leaveType.save();
    res.status(201).json({ success: true, leaveType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Edit a leave type
router.put('/leave-type/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.json({ success: true, leaveType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete a leave type
router.delete('/leave-type/:id', async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndDelete(req.params.id);
    if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.json({ success: true, message: 'Leave type deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router; 