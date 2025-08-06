const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  role: { 
    type: String, 
    required: false,
    enum: ['employee', 'manager', 'admin']
  },
  department: { 
    type: String, 
    required: false,
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
}, {
  timestamps: true // Add timestamps for debugging
});

// Add a method to get total leave balance
userSchema.methods.getTotalLeaveBalance = function() {
  const balance = this.leaveBalance || {};
  return (balance.casual || 0) + (balance.sick || 0) + (balance.earned || 0);
};

module.exports = mongoose.model('User', userSchema);
