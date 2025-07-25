const Admin = require('../common/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Category = require('../common/category.model');

async function createDefaultAdmin() {
  const email = 'admin@example.com';
  const password = 'admin123';

  const existing = await Admin.findOne({ email });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({
      email,
      password: hashedPassword,
      name: 'Super Admin'
    });
    console.log('Default admin user created:', email);
  } else {
    console.log('Default admin user already exists.');
  }
}

// Call this function after MongoDB connection is established

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ status: false, message: 'Invalid credentials', data: {} });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: 'Invalid credentials', data: {} });
    }
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const adminProfile = await Admin.findById(admin._id).select('-password');
    res.json({ status: true, message: 'Login successful', data: { token, admin: adminProfile } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ status: false, message: 'Admin not found', data: {} });
    res.json({ status: true, message: 'Admin profile retrieved', data: {admin} });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.updateAdminProfile = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const admin = await Admin.findByIdAndUpdate(req.admin.id, updateData, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ status: false, message: 'Admin not found', data: {} });
    res.json({ status: true, message: 'Admin profile updated', data: admin });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

exports.logout = (req, res) => {
  // For JWT, logout is handled on the client by deleting the token
  res.json({ status: true, message: 'Logged out successfully', data: {} });
};

exports.createCategory = async (req, res) => {
  try {
    const { title, slug, isSuspended, isDeleted, images } = req.body;
    // Check if slug is unique
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ status: false, message: 'Slug must be unique', data: {} });
    }
    const category = new Category({
      title,
      slug,
      isSuspended: !!isSuspended,
      isDeleted: !!isDeleted,
      images: Array.isArray(images) ? images : []
    });
    await category.save();
    res.status(201).json({ status: true, message: 'Category created', data: { category } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.json({ status: true, message: 'Categories fetched', data: { categories } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted) {
      return res.status(404).json({ status: false, message: 'Category not found', data: {} });
    }
    res.json({ status: true, message: 'Category fetched', data: { category } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { title, slug, isSuspended, isDeleted, images } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (typeof isSuspended !== 'undefined') updateData.isSuspended = isSuspended;
    if (typeof isDeleted !== 'undefined') updateData.isDeleted = isDeleted;
    if (images) updateData.images = images;
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category || category.isDeleted) {
      return res.status(404).json({ status: false, message: 'Category not found', data: {} });
    }
    res.json({ status: true, message: 'Category updated', data: { category } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!category) {
      return res.status(404).json({ status: false, message: 'Category not found', data: {} });
    }
    res.json({ status: true, message: 'Category deleted', data: { category } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.createAdmin = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ status: false, message: 'Email, password, and name are required.' });
  }
  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: false, message: 'Admin already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, password: hashedPassword, name });
    res.status(201).json({ status: true, message: 'Admin created', data: { admin } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
}; 