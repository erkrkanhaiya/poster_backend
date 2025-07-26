const User = require('../common/users.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// OTP DEV/PROD MODE: Set DEV_OTP_BYPASS=true in .env to always use 123456 as OTP for dev/testing.
// In production, set DEV_OTP_BYPASS=false or remove it.

const otps = {}; // In-memory OTP store: { phone: { otp, expiresAt } }
const DEV_OTP_BYPASS = process.env.DEV_OTP_BYPASS === 'true';

exports.userLoginOrRegister = async (req, res) => {
  const { phone, password } = req.body;
  try {
    let user = await User.findOne({ phone });
    if (user) {
      // Login
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ status: false, message: 'Invalid credentials', data: {} });
      }
      const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ status: true, message: 'Login successful', data: { token, isProfileCompleted: user.isProfileCompleted, user: { id: user._id, phone: user.phone, isProfileCompleted: user.isProfileCompleted } } });
    } else {
      // Register
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ phone, password: hashedPassword, isProfileCompleted: false });
      await user.save();
      const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ status: true, message: 'Registration successful', data: { token, isProfileCompleted: false, user: { id: user._id, phone: user.phone, isProfileCompleted: false } } });
    }
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.completeProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;
  if (!name || !email) {
    return res.status(400).json({ status: false, message: 'Name and email are required', data: {} });
  }
  try {
    const user = await User.findByIdAndUpdate(userId, { name, email, isProfileCompleted: true }, { new: true });
    if (!user) return res.status(404).json({ status: false, message: 'User not found', data: {} });
    res.json({ status: true, message: 'Profile completed', data: { user } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ status: false, message: 'User not found', data: {} });
    res.json({ status: true, message: 'User profile retrieved', data: { user } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ status: false, message: 'User not found', data: {} });
    res.json({ status: true, message: 'User profile updated', data: { user } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.logout = (req, res) => {
  // For JWT, logout is handled on the client by deleting the token
  res.json({ status: true, message: 'Logged out successfully', data: {} });
};

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ status: false, message: 'Phone is required', data: {} });

  // Use fixed OTP in dev, random in prod
  const otp = DEV_OTP_BYPASS ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  otps[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  // In dev, return OTP in response; in prod, do not
  if (DEV_OTP_BYPASS) {
    return res.json({ status: true, message: 'OTP sent', data: { otp } });
  }
  // In prod, just log OTP (replace with SMS integration in real prod)
  console.log(`Sending OTP ${otp} to phone ${phone}`);
  res.json({ status: true, message: 'OTP sent', data: {} });
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ status: false, message: 'Phone and OTP are required', data: {} });

  // In dev, always accept 123456
  if (DEV_OTP_BYPASS && otp === '123456') {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, isProfileCompleted: false });
      await user.save();
    }
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    delete otps[phone];
    return res.json({ status: true, message: 'Login successful', data: { token, user: { id: user._id, phone: user.phone, isProfileCompleted: user.isProfileCompleted } } });
  }

  const record = otps[phone];
  if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
    return res.status(400).json({ status: false, message: 'Invalid or expired OTP', data: {} });
  }
  // OTP valid, log in or register user
  let user = await User.findOne({ phone });
  if (!user) {
    user = new User({ phone, isProfileCompleted: false });
    await user.save();
  }
  const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  delete otps[phone];
  res.json({ status: true, message: 'Login successful', data: { token, user: { id: user._id, phone: user.phone, isProfileCompleted: user.isProfileCompleted } } });
}; 