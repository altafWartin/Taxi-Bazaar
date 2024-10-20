const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobileNumber: { 
    type: String, 
    required: true,
    unique: true // Ensure the mobile number is unique
  },
  otp: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: '10m' // Automatically remove OTP after 10 minutes
  }
});

// Create the OTP model
const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
