const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  role: { 
    type: String, 
    required: false, // Changed to false
    enum: ['employee', 'manager', 'admin']
  },
  department: { 
    type: String, 
    required: false, // Changed to false
    enum: ['hr', 'engineering', 'sales']
  },
  manager: { 
    type: String 
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 12 },
    earned: { type: Number, default: 15 }
  }
});

module.exports = mongoose.model('User', userSchema);
