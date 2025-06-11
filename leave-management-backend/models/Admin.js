const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  role: {
    type: String,
    default: 'admin'
  },
  otp: {
    code: String,
    expiresAt: Date
  }
});

module.exports = mongoose.model('Admin', adminSchema);
