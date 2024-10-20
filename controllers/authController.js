const Otp = require('../models/Otp'); // Import the OTP model
const User = require('../models/userModel'); // Import your User model
const { sendOTP } = require('../services/twilioService'); // Your Twilio function for sending OTP

const jwt = require('jsonwebtoken');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 6-digit OTP
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, 'YOUR_JWT_SECRET', { expiresIn: '1h' }); // Replace with your secret
};

// Send OTP function
exports.sendOtp = async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    const otp = generateOTP(); // Generate OTP
    console.log('Generated OTP:', otp);

    // await sendOTP(mobileNumber, otp); // Send OTP via Twilio
    console.log('OTP sent successfully to:', mobileNumber);

    // Check if an OTP already exists for the mobile number
    const existingOtpEntry = await Otp.findOne({ mobileNumber });

    if (existingOtpEntry) {
      // Update the existing OTP
      existingOtpEntry.otp = otp; // Update with new OTP
      existingOtpEntry.createdAt = Date.now(); // Reset the timestamp
      await existingOtpEntry.save(); // Save the updated entry
    } else {
      // Create a new OTP entry if it doesn't exist
      const otpEntry = new Otp({ mobileNumber, otp });
      await otpEntry.save();
    }

    res.status(200).json({ message: 'OTP sent successfully', otp }); // Send OTP in the response
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Verify OTP function
exports.verifyOtp = async (req, res) => {
  const { mobileNumber, otp } = req.body;

  try {
    // Find the OTP entry for the given mobile number
    const otpEntry = await Otp.findOne({ mobileNumber, otp });

    if (!otpEntry) {
      return res.status(400).json({ message: 'Invalid OTP or mobile number' });
    }

    // OTP is valid, proceed to delete it
    await Otp.deleteOne({ _id: otpEntry._id }); // Remove OTP after successful verification

    // Check if the user already exists
    const user = await User.findOne({ mobileNumber });

    if (user) {
      // User exists, generate a token for existing user
      const token = generateToken({ mobileNumber });
      return res.status(200).json({ message: 'Welcome back, existing user!', token });
    } else {
      // User does not exist, you might want to create a new user
      const newUser = new User({ mobileNumber });
      await newUser.save(); // Save the new user

      // Generate a token for the new user
      const token = generateToken({ mobileNumber });
      return res.status(200).json({ message: 'Signup successful, new user!', token });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};


// Logout function
exports.logout = async (req, res) => {
  try {
    // In the case of JWT, logout is generally handled client-side by removing the token.
    // But, if you're storing tokens server-side (like blacklisting), you would implement that logic here.

    // For a simple client-side token removal:
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error.message);
    res.status(500).json({ message: 'Failed to logout', error: error.message });
  }
};
