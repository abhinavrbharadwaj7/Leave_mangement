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
    enum: ['employee', 'manager']
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
  }
});

module.exports = mongoose.model('User', userSchema);
