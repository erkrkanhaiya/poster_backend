const Admin = require('../common/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Category = require('../common/category.model');
const Banner = require('../common/banner.model');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// S3 config (replace with your credentials and bucket)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

console.log('AWS_BUCKET:', process.env.AWS_BUCKET);

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET, // <-- FIXED
    // acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `banners${Date.now()}_${file.originalname}`);
    }
  })
});

// Middleware for banner image upload (multiple)
exports.uploadBannerImages = upload.array('images', 10);

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
            const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const adminProfile = await Admin.findById(admin._id).select('-password');
    res.json({ status: true, message: 'Login successful', data: { token, admin: adminProfile } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Refresh admin token
exports.refreshToken = async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    // Find admin
    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ status: false, message: 'Admin not found', data: {} });
    }

    // Generate new token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
      status: true, 
      message: 'Token refreshed successfully', 
      data: { 
        token,
        admin
      } 
    });
  } catch (err) {
    console.error('Error in refreshToken:', err);
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

// Get all categories (for user interest selection)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      isSuspended: false, 
      isDeleted: false 
    }).select('title slug images').sort({ title: 1 });
    
    res.json({ 
      status: true, 
      message: 'Categories fetched successfully', 
      data: { 
        categories,
        total: categories.length
      } 
    });
  } catch (err) {
    console.error('Error in getCategories:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
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
    // Get banner count for each category
    const categoryIds = categories.map(cat => cat._id);
    const bannerCounts = await Banner.aggregate([
      { $match: { category: { $in: categoryIds } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    bannerCounts.forEach(bc => { countMap[bc._id.toString()] = bc.count; });
    const categoriesWithCount = categories.map(cat => ({
      ...cat.toObject(),
      bannerCount: countMap[cat._id.toString()] || 0
    }));
    res.json({ status: true, message: 'Categories fetched', data: { categories: categoriesWithCount } });
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

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().populate('category', 'title');
    res.json({ status: true, message: 'Banners fetched', data: { banners } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id).populate('category', 'title');
    if (!banner) return res.status(404).json({ status: false, message: 'Banner not found', data: {} });
    res.json({ status: true, message: 'Banner fetched', data: { banner } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !category || !req.files || req.files.length === 0) {
      return res.status(400).json({ status: false, message: 'Title, category, and images are required', data: {} });
    }
    const imageUrls = req.files.map(file => file.location);
    const banner = await Banner.create({ title, images: imageUrls, category });
    res.status(201).json({ status: true, message: 'Banner created', data: { banner } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { title, image, category } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (image) updateData.image = image;
    if (category) updateData.category = category;
    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!banner) return res.status(404).json({ status: false, message: 'Banner not found', data: {} });
    res.json({ status: true, message: 'Banner updated', data: { banner } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ status: false, message: 'Banner not found', data: {} });
    // Remove images from S3
    const keys = (banner.images || []).map(url => {
      // Extract the S3 key from the URL
      const match = url.match(/\/([^/]+\/[^?]+)/);
      return match ? match[1] : null;
    }).filter(Boolean);
    if (keys.length > 0) {
      const objects = keys.map(Key => ({ Key }));
      await s3.deleteObjects({
        Bucket: process.env.AWS_BUCKET,
        Delete: { Objects: objects }
      }).promise();
    }
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ status: true, message: 'Banner deleted', data: { banner } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
};

exports.deleteBannerImage = async (req, res) => {
  const { bannerId } = req.params;
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ status: false, message: 'Image URL required', data: {} });
  try {
    const banner = await Banner.findById(bannerId);
    if (!banner) return res.status(404).json({ status: false, message: 'Banner not found', data: {} });
    // Remove image from S3
    const match = imageUrl.match(/\/([^/]+\/[^?]+)/);
    const key = match ? match[1] : null;
    if (key) {
      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET, // Use the consistent env variable
        Key: key
      }).promise();
    }
    // Remove image from banner
    banner.images = banner.images.filter(img => img !== imageUrl);
    await banner.save();
    res.json({ status: true, message: 'Image deleted', data: { banner } });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', data: { error: err.message } });
  }
}; 