const User = require('../common/users.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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