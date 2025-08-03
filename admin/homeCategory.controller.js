const HomeCategory = require('../common/homeCategory.model');
const Category = require('../common/category.model');

// Add categories to home page (array of category IDs)
exports.addHomeCategories = async (req, res) => {
  try {
    const { categoryIds } = req.body;
    const adminId = req.admin.id;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ 
        status: false, 
        message: 'Category IDs array is required', 
        data: {} 
      });
    }

    // Validate all categories exist
    const categories = await Category.find({ _id: { $in: categoryIds } });
    if (categories.length !== categoryIds.length) {
      return res.status(404).json({ 
        status: false, 
        message: 'One or more categories not found', 
        data: {} 
      });
    }

    // Check which categories are already added to home
    const existingHomeCategories = await HomeCategory.find({
      categoryId: { $in: categoryIds }
    });

    const existingCategoryIds = existingHomeCategories.map(hc => hc.categoryId.toString());
    const newCategoryIds = categoryIds.filter(id => !existingCategoryIds.includes(id));

    if (newCategoryIds.length === 0) {
      return res.status(400).json({ 
        status: false, 
        message: 'All categories are already added to home page', 
        data: {} 
      });
    }

    // Create home categories for new ones
    const homeCategoriesToAdd = newCategoryIds.map(categoryId => ({
      categoryId,
      addedBy: adminId
    }));

    const homeCategories = await HomeCategory.insertMany(homeCategoriesToAdd);

    // Populate category details
    await HomeCategory.populate(homeCategories, { path: 'categoryId', select: 'title slug' });

    res.status(201).json({ 
      status: true, 
      message: `${homeCategories.length} categories added to home page successfully`, 
      data: { 
        homeCategories,
        added: homeCategories.length,
        alreadyExists: existingCategoryIds.length
      } 
    });

  } catch (error) {
    console.error('Error in addHomeCategories:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
};

// Get all home categories
exports.getHomeCategories = async (req, res) => {
  try {
    const homeCategories = await HomeCategory.find()
      .populate('categoryId', 'title slug')
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    // Extract category IDs for frontend
    const categoryIds = homeCategories.map(hc => hc.categoryId._id.toString());

    res.json({ 
      status: true, 
      message: 'Home categories fetched successfully', 
      data: { 
        categoryIds,
        homeCategories
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

// Update home category
exports.updateHomeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    const homeCategory = await HomeCategory.findById(id);
    if (!homeCategory) {
      return res.status(404).json({ 
        status: false, 
        message: 'Home category not found', 
        data: {} 
      });
    }

    // Update fields
    if (isSuspended !== undefined) homeCategory.isSuspended = isSuspended;

    await homeCategory.save();
    await homeCategory.populate('categoryId', 'title slug');

    res.json({ 
      status: true, 
      message: 'Home category updated successfully', 
      data: { homeCategory } 
    });

  } catch (error) {
    console.error('Error in updateHomeCategory:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
};

// Delete home category (permanent delete)
exports.deleteHomeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const homeCategory = await HomeCategory.findById(id);
    if (!homeCategory) {
      return res.status(404).json({ 
        status: false, 
        message: 'Home category not found', 
        data: {} 
      });
    }

    // Permanent delete
    await HomeCategory.findByIdAndDelete(id);

    res.json({ 
      status: true, 
      message: 'Home category deleted successfully', 
      data: {} 
    });

  } catch (error) {
    console.error('Error in deleteHomeCategory:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
};

// Suspend/Unsuspend home category
exports.toggleSuspendHomeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const homeCategory = await HomeCategory.findById(id);
    if (!homeCategory) {
      return res.status(404).json({ 
        status: false, 
        message: 'Home category not found', 
        data: {} 
      });
    }

    // Toggle suspend status
    homeCategory.isSuspended = !homeCategory.isSuspended;
    await homeCategory.save();

    const action = homeCategory.isSuspended ? 'suspended' : 'unsuspended';

    res.json({ 
      status: true, 
      message: `Home category ${action} successfully`, 
      data: { 
        homeCategory: {
          id: homeCategory._id,
          isSuspended: homeCategory.isSuspended
        }
      } 
    });

  } catch (error) {
    console.error('Error in toggleSuspendHomeCategory:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
}; 