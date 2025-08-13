const Category = require('../common/category.model');

// Get all categories for user interest selection
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

// Get category by ID (for user reference)
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id,
      isSuspended: false, 
      isDeleted: false 
    }).select('title slug images');
    
    if (!category) {
      return res.status(404).json({ status: false, message: 'Category not found', data: {} });
    }
    
    res.json({ 
      status: true, 
      message: 'Category fetched successfully', 
      data: { category } 
    });
  } catch (err) {
    console.error('Error in getCategoryById:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Search categories by title
exports.searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ status: false, message: 'Search query is required', data: {} });
    }
    
    const categories = await Category.find({ 
      title: { $regex: q, $options: 'i' },
      isSuspended: false, 
      isDeleted: false 
    }).select('title slug images').sort({ title: 1 });
    
    res.json({ 
      status: true, 
      message: 'Categories searched successfully', 
      data: { 
        categories,
        total: categories.length,
        query: q
      } 
    });
  } catch (err) {
    console.error('Error in searchCategories:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
}; 