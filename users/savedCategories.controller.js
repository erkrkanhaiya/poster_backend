const SavedCategories = require('../common/savedCategories.model');

// Get saved categories for mobile app (public endpoint)
exports.getSavedCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = search 
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const filter = { 
      isActive: true,
      ...searchFilter 
    };

    const savedCategories = await SavedCategories.find(filter)
      .populate({
        path: 'subcategories',
        match: { isDeleted: false, isSuspended: false },
        populate: {
          path: 'category',
          select: 'title slug'
        },
        select: 'title slug category images sortOrder'
      })
      .select('title description subcategories sortOrder createdAt')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out saved categories that have no valid subcategories after population
    const filteredSavedCategories = savedCategories.filter(
      savedCat => savedCat.subcategories && savedCat.subcategories.length > 0
    );

    const total = await SavedCategories.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));
    const currentPage = parseInt(page);

    // Calculate serial number start
    const serialNumberStartFrom = skip + 1;

    res.json({
      status: true,
      message: 'Saved categories retrieved successfully',
      data: {
        savedCategories: filteredSavedCategories,
        totalSavedCategories: total,
        limit: parseInt(limit),
        page: currentPage,
        totalPages: totalPages,
        serialNumberStartFrom: serialNumberStartFrom,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < totalPages ? currentPage + 1 : null
      }
    });
  } catch (err) {
    console.error('Error in getSavedCategories:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get saved category by ID for mobile app
exports.getSavedCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const savedCategory = await SavedCategories.findOne({
      _id: id,
      isActive: true
    })
    .populate({
      path: 'subcategories',
      match: { isDeleted: false, isSuspended: false },
      populate: {
        path: 'category',
        select: 'title slug'
      },
      select: 'title slug category images sortOrder'
    })
    .select('title description subcategories sortOrder createdAt');

    if (!savedCategory) {
      return res.status(404).json({ 
        status: false, 
        message: 'Saved category not found or inactive', 
        data: {} 
      });
    }

    // Check if saved category has valid subcategories
    if (!savedCategory.subcategories || savedCategory.subcategories.length === 0) {
      return res.status(404).json({ 
        status: false, 
        message: 'Saved category has no available subcategories', 
        data: {} 
      });
    }

    res.json({
      status: true,
      message: 'Saved category retrieved successfully',
      data: { savedCategory }
    });
  } catch (err) {
    console.error('Error in getSavedCategoryById:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get trending saved categories (most recently created)
exports.getTrendingSavedCategories = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const trendingSavedCategories = await SavedCategories.find({
      isActive: true
    })
    .populate({
      path: 'subcategories',
      match: { isDeleted: false, isSuspended: false },
      populate: {
        path: 'category',
        select: 'title slug'
      },
      select: 'title slug category images sortOrder'
    })
    .select('title description subcategories sortOrder createdAt')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    // Filter out saved categories that have no valid subcategories
    const filteredTrendingCategories = trendingSavedCategories.filter(
      savedCat => savedCat.subcategories && savedCat.subcategories.length > 0
    );

    res.json({
      status: true,
      message: 'Trending saved categories retrieved successfully',
      data: { 
        trendingSavedCategories: filteredTrendingCategories,
        total: filteredTrendingCategories.length
      }
    });
  } catch (err) {
    console.error('Error in getTrendingSavedCategories:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};