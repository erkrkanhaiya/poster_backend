const User = require('../common/users.model');
const OTP = require('../common/otp.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fast2smsService = require('../utils/fast2sms');

// OTP DEV/PROD MODE: Set DEV_OTP_BYPASS=true in .env to always use 1234 as OTP for dev/testing.
// In production, set DEV_OTP_BYPASS=false or remove it.
const DEV_BYPASS = process.env.DEV_OTP_BYPASS === 'true';

exports.userLoginOrRegister = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ status: false, message: 'Phone number is required', data: {} });
  }

  try {
    // Generate 4-digit OTP
    const otp = DEV_BYPASS ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();
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
    // if (DEV_BYPASS) {
    //   return res.json({
    //     status: true,
    //     message: 'OTP sent successfully',
    //     data: {
    //       otp,
    //       message: 'Use this OTP for verification (development mode)'
    //     }
    //   });
    // }

    // In production, send OTP via Fast2SMS
    const smsResult = await fast2smsService.sendOTP(phone, otp);
    
    if (smsResult.success) {
      return res.json({
        status: true,
        message: 'OTP sent successfully',
        data: {}
      });
    } else {
      console.error('SMS sending failed:', smsResult.message);
      return res.status(500).json({
        status: false,
        message: 'Failed to send OTP. Please try again.',
        data: {}
      });
    }

  } catch (err) {
    console.error('Error in userLoginOrRegister:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.completeProfile = async (req, res) => {
  const { name, phone } = req.body;

  try {
    let user;

    // Check if user exists (for existing users with incomplete profile)
    if (req.user && req.user.id) {
      // Existing user - update profile
      user = await User.findByIdAndUpdate(
        req.user.id,
        {
          name,
          isProfileCompleted: true
        },
        { new: true }
      ).select('-password').populate('interests', 'title slug');

      if (!user) return res.status(404).json({ status: false, message: 'User not found', data: {} });
    } else if (phone) {
      // Check if phone number already exists before creating new user
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(409).json({
          status: false,
          message: 'Phone number already registered. Please login with this number.',
          data: {}
        });
      }

      // New user - create new record
      user = new User({
        phone,
        name,
        isProfileCompleted: true,
        createdAt: new Date()
      });
      await user.save();
      user = await User.findById(user._id).select('-password').populate('interests', 'title slug');
    } else {
      return res.status(400).json({ status: false, message: 'Phone number is required for new users', data: {} });
    }

    // Generate JWT token for completed profile
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      status: true,
      message: 'Profile completed successfully',
      data: {
        token,
        user
      }
    });
  } catch (err) {
    console.error('Error in completeProfile:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('interests', 'title slug');

    if (!user) return res.status(404).json({ status: false, message: 'User not found', data: {} });
    user.isPremium = false
    return res.json({ status: true, message: 'User profile retrieved', data: { user } });
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { name, email, password, interests, profilePhoto, logo } = req.body;
  try {
    const updateData = {};

    // Only update fields that are provided (including null/empty values to clear fields)
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 10);
      } else {
        updateData.password = null; // Clear password
      }
    }
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
    return res.json({ status: true, message: 'User profile updated', data: { user } });
  } catch (err) {
    console.error('Error in updateUserProfile:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.logout = (req, res) => {
  // For JWT, logout is handled on the client by deleting the token
  return res.json({ status: true, message: 'Logged out successfully', data: {} });
};

// Get all users (for admin purposes)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({
      status: true,
      message: 'Users fetched successfully',
      data: {
        users,
        total: users.length
      }
    });
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get user by ID (for admin purposes)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found', data: {} });
    }
    return res.json({
      status: true,
      message: 'User fetched successfully',
      data: { user }
    });
  } catch (err) {
    console.error('Error in getUserById:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
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

    // Generate 4-digit OTP
    const otp = process.env.DEV_OTP_BYPASS === 'true' ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();
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

    // // In development mode, return OTP in response
    // if (DEV_BYPASS) {
    //   return res.json({
    //     status: true,
    //     message: 'OTP sent successfully',
    //     data: {
    //       otp,
    //       message: 'Use this OTP for verification (development mode)'
    //     }
    //   });
    // }

    // In production, send OTP via Fast2SMS
    const smsResult = await fast2smsService.sendOTP(phone, otp);
    
    if (smsResult.success) {
      return res.json({
        status: true,
        message: 'OTP sent successfully',
        data: {}
      });
    } else {
      console.error('SMS sending failed:', smsResult.message);
      return res.status(500).json({
        status: false,
        message: 'Failed to send OTP. Please try again.',
        data: {}
      });
    }

  } catch (err) {
    console.error('Error in sendOtp:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Resend OTP when verification fails
exports.resendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ status: false, message: 'Phone number is required', data: {} });
  }

  try {
    // Validate phone number format
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ 
        status: false, 
        message: 'Invalid phone number format. Must be 10 digits.', 
        data: {} 
      });
    }

    // Check if there's a recent OTP request (rate limiting)
    const recentOtp = await OTP.findOne({
      phone,
      isUsed: false,
      createdAt: { $gte: new Date(Date.now() - 30 * 1000) } // Within last 30 seconds
    });

    if (recentOtp) {
      return res.status(429).json({
        status: false,
        message: 'Please wait 30 seconds before requesting another OTP',
        data: {}
      });
    }

    // Generate 4-digit OTP
    const otp = process.env.DEV_OTP_BYPASS === 'true' ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();
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

    // // In development mode, return OTP in response
    // if (DEV_BYPASS) {
    //   return res.json({
    //     status: true,
    //     message: 'New OTP sent successfully',
    //     data: {
    //       otp,
    //       message: 'Use this OTP for verification (development mode)'
    //     }
    //   });
    // }

    // In production, send OTP via Fast2SMS
    const smsResult = await fast2smsService.sendOTP(phone, otp);
    
    if (smsResult.success) {
      return res.json({
        status: true,
        message: 'New OTP sent successfully via SMS',
        data: {}
      });
    } else {
      console.error('SMS sending failed:', smsResult.message);
      return res.status(500).json({
        status: false,
        message: 'Failed to send new OTP. Please try again.',
        data: {}
      });
    }

  } catch (err) {
    console.error('Error in resendOtp:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ status: false, message: 'Phone and OTP are required', data: {} });
  }

  try {
    // Validate phone number format (10 digits for India)
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ 
        status: false, 
        message: 'Invalid phone number format. Must be 10 digits.', 
        data: {} 
      });
    }

    // Validate OTP format (4 digits)
    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      return res.status(400).json({ 
        status: false, 
        message: 'Invalid OTP format. Must be 4 digits.', 
        data: {} 
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      phone,
      isUsed: false,
      expiresAt: { $gt: new Date() } // Not expired
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        status: false, 
        message: 'OTP not found or expired. Please request a new OTP.', 
        data: {} 
      });
    }

    // Check if OTP matches (with special handling for dev mode)
    const isValidOtp = DEV_BYPASS ? (otp === '1234' || otp === otpRecord.otp) : (otp === otpRecord.otp);

    if (!isValidOtp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      // If too many attempts, mark as used and suggest resending
      if (otpRecord.attempts >= 3) {
        otpRecord.isUsed = true;
        await otpRecord.save();
        return res.status(400).json({ 
          status: false, 
          message: 'Too many failed attempts. Please request a new OTP via SMS.', 
          data: {
            attemptsExceeded: true,
            suggestion: 'Use the send OTP endpoint to get a new code'
          }
        });
      }

      return res.status(400).json({ 
        status: false, 
        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`, 
        data: {
          attemptsRemaining: 3 - otpRecord.attempts
        }
      });
    }

    // OTP is valid, mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Log successful OTP verification
    console.log(`OTP verified successfully for phone: ${phone}`);

    // Find existing user
    const user = await User.findOne({ phone });

    if (!user) {
      // New user - don't create record yet, just verify OTP
      return res.json({
        status: true,
        message: 'OTP verified successfully. Please complete your profile.',
        data: {
          token: null,
          requiresProfileCompletion: true,
          isNewUser: true,
          phone: phone,
          otpVerified: true
        }
      });
    } else if (!user.isProfileCompleted) {
      // Existing user with incomplete profile
      return res.json({
        status: true,
        message: 'OTP verified successfully. Please complete your profile.',
        data: {
          token: null,
          requiresProfileCompletion: true,
          isNewUser: false,
          otpVerified: true,
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
    } else {
      // Existing user with complete profile - generate token
      const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });

      return res.json({
        status: true,
        message: 'OTP verified successfully. Welcome back!',
        data: {
          token,
          requiresProfileCompletion: false,
          isNewUser: false,
          otpVerified: true,
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
    }

  } catch (err) {
    console.error('Error in verifyOtp:', err);
    return res.status(500).json({ 
      status: false, 
      message: 'Server error during OTP verification', 
      data: {} 
    });
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

    return res.json({
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
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: false,
      message: 'Current password and new password are required',
      data: {}
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      status: false,
      message: 'New password must be at least 6 characters long',
      data: {}
    });
  }

  try {
    // Find user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found', data: {} });
    }

    // Check if user has a password set (for users who registered without password)
    if (!user.password) {
      return res.status(400).json({
        status: false,
        message: 'No password set for this account. Please set a password first.',
        data: {}
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: false,
        message: 'Current password is incorrect',
        data: {}
      });
    }

    // Check if new password is same as current password
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      return res.status(400).json({
        status: false,
        message: 'New password must be different from current password',
        data: {}
      });
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.json({
      status: true,
      message: 'Password changed successfully',
      data: {}
    });
  } catch (err) {
    console.error('Error in changePassword:', err);
    return res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
}; 