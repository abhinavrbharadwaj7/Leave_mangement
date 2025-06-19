const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: ['casual', 'sick', 'earned']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  manager: {
    type: String,
    required: true // manager's email
  },
  managerComment: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
