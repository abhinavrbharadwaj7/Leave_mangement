const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  role: { 
    type: String, 
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  department: { 
    type: String, 
    enum: ['hr', 'engineering', 'sales', 'administration'],
    default: 'Not Assigned'
  },
  manager: { 
    type: String,
    default: 'Not Assigned'
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  leaveBalance: {
    casual: { type: Number, default: 5 },
    sick: { type: Number, default: 5 },
    earned: { type: Number, default: 10 }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
