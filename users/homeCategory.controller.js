const HomeCategory = require('../common/homeCategory.model');

// Get home categories for users
exports.getHomeCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get all home categories
    const homeCategories = await HomeCategory.find()
      .populate('categoryId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await HomeCategory.countDocuments();

    // Format response for user side
    const formattedCategories = homeCategories.map(hc => ({
      id: hc._id,
      category: hc.categoryId,
      addedAt: hc.createdAt
    }));

    res.json({ 
      status: true, 
      message: 'Home categories fetched successfully', 
      data: { 
        categories: formattedCategories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      } 
    });

  } catch (error) {
    console.error('Error in getHomeCategories:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
}; 