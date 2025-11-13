const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// Get all departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create department
router.post('/departments', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ success: false, message: 'Department already exists' });
    const department = new Department({ name, description });
    await department.save();
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update department
router.put('/departments/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete department
router.delete('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get single department
router.get('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
