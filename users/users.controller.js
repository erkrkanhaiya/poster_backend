const User = require('../common/users.model');
const OTP = require('../common/otp.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// OTP DEV/PROD MODE: Set DEV_OTP_BYPASS=true in .env to always use 123456 as OTP for dev/testing.
// In production, set DEV_OTP_BYPASS=false or remove it.
const DEV_OTP_BYPASS = process.env.DEV_OTP_BYPASS === 'true';

exports.userLoginOrRegister = async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ status: false, message: 'Phone number is required', data: {} });
  }

  try {
    // Generate OTP
    const otp = DEV_OTP_BYPASS ? '1234' : Math.floor(100000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Delete any existing unused OTPs for this phone
    await OTP.deleteMany({ phone, isUsed: false });

    // Create new OTP record
    const otpRecord = new OTP({
      phone,
      otp,
      expiresAt
    });
    await otpRecord.save();

    // In development mode, return OTP in response
    if (DEV_OTP_BYPASS) {
      return res.json({ 
        status: true, 
        message: 'OTP sent successfully', 
        data: { 
          otp,
          message: 'Use this OTP for verification (development mode)'
        } 
      });
    }

    // In production, send OTP via SMS (implement your SMS service here)
    console.log(`Sending OTP ${otp} to phone ${phone}`);
    
    res.json({ 
      status: true, 
      message: 'OTP sent successfully', 
      data: {} 
    });

  } catch (err) {
    console.error('Error in userLoginOrRegister:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.completeProfile = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  
  try {
    const user = await User.findByIdAndUpdate(
      userId, 
      { 
        name, 
        isProfileCompleted: true 
      }, 
      { new: true }
    ).select('-password').populate('interests', 'title slug');
    
    if (!user) return res.status(404).json({ status: false, message: 'User not found', data: {} });
    res.json({ status: true, message: 'Profile completed successfully', data: { user } });
  } catch (err) {
    console.error('Error in completeProfile:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('interests', 'title slug');
    
    if (!user) return res.status(404).json({ status: false, message: 'User not found', data: {} });
    res.json({ status: true, message: 'User profile retrieved', data: { user } });
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { name, email, password, interests, profilePhoto, logo } = req.body;
  try {
    const updateData = {};
    
    // Only update fields that are provided (including empty strings and null values)
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = await bcrypt.hash(password, 10);
    if (interests !== undefined) updateData.interests = interests;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (logo !== undefined) updateData.logo = logo;
    
    // Check if any data was provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ status: false, message: 'No data provided for update', data: {} });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true }
    ).select('-password').populate('interests', 'title slug');
    
    if (!user) return res.status(404).json({ status: false, message: 'User not found', data: {} });
    res.json({ status: true, message: 'User profile updated', data: { user } });
  } catch (err) {
    console.error('Error in updateUserProfile:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.logout = (req, res) => {
  // For JWT, logout is handled on the client by deleting the token
  res.json({ status: true, message: 'Logged out successfully', data: {} });
};

// Get all users (for admin purposes)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ 
      status: true, 
      message: 'Users fetched successfully', 
      data: { 
        users,
        total: users.length
      } 
    });
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get user by ID (for admin purposes)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found', data: {} });
    }
    res.json({ 
      status: true, 
      message: 'User fetched successfully', 
      data: { user } 
    });
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ status: false, message: 'Phone number is required', data: {} });
  }

  try {
    // Check if there's a recent OTP request (rate limiting)
    const recentOtp = await OTP.findOne({ 
      phone, 
      isUsed: false,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // Within last 1 minute
    });

    if (recentOtp) {
      return res.status(429).json({ 
        status: false, 
        message: 'Please wait 1 minute before requesting another OTP', 
        data: {} 
      });
    }

    // Generate OTP
    const otp = DEV_OTP_BYPASS ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Delete any existing unused OTPs for this phone
    await OTP.deleteMany({ phone, isUsed: false });

    // Create new OTP record
    const otpRecord = new OTP({
      phone,
      otp,
      expiresAt
    });
    await otpRecord.save();

    // In development mode, return OTP in response
    if (DEV_OTP_BYPASS) {
      return res.json({ 
        status: true, 
        message: 'OTP sent successfully', 
        data: { 
          otp,
          message: 'Use this OTP for verification (development mode)'
        } 
      });
    }

    // In production, send OTP via SMS (implement your SMS service here)
    console.log(`Sending OTP ${otp} to phone ${phone}`);
    
    res.json({ 
      status: true, 
      message: 'OTP sent successfully', 
      data: {} 
    });

  } catch (err) {
    console.error('Error in sendOtp:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({ status: false, message: 'Phone and OTP are required', data: {} });
  }

  try {
    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      phone, 
      isUsed: false,
      expiresAt: { $gt: new Date() } // Not expired
    });

    if (!otpRecord) {
      return res.status(400).json({ status: false, message: 'OTP not found or expired', data: {} });
    }

    // Check if OTP matches (with special handling for dev mode)
    const isValidOtp = DEV_OTP_BYPASS ? (otp === '1234' || otp === otpRecord.otp) : (otp === otpRecord.otp);
    
    if (!isValidOtp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      // If too many attempts, mark as used
      if (otpRecord.attempts >= 3) {
        otpRecord.isUsed = true;
        await otpRecord.save();
        return res.status(400).json({ status: false, message: 'Too many failed attempts. Please request a new OTP', data: {} });
      }

      return res.status(400).json({ status: false, message: 'Invalid OTP', data: {} });
    }

    // OTP is valid, mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ 
        phone, 
        isProfileCompleted: false,
        createdAt: new Date()
      });
      await user.save();
    }

    // Generate JWT token
            const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Return user data
    res.json({ 
      status: true, 
      message: 'OTP verified successfully', 
      data: { 
        token, 
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          interests: user.interests,
          profilePhoto: user.profilePhoto,
          logo: user.logo,
          isProfileCompleted: user.isProfileCompleted,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      } 
    });

  } catch (err) {
    console.error('Error in verifyOtp:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found', data: {} });
    }

    // Generate new token
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
      status: true, 
      message: 'Token refreshed successfully', 
      data: { 
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isProfileCompleted: user.isProfileCompleted
        }
      } 
    });
  } catch (err) {
    console.error('Error in refreshToken:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
}; 