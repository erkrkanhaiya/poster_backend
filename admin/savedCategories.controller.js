const SavedCategories = require('../common/savedCategories.model');
const Subcategory = require('../common/subcategory.model');

// Get all saved categories (admin view)
exports.getSavedCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = search 
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const filter = { ...searchFilter };

    const savedCategories = await SavedCategories.find(filter)
      .populate({
        path: 'subcategories',
        populate: {
          path: 'category',
          select: 'title slug'
        }
      })
      .populate('createdBy', 'name email')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SavedCategories.countDocuments(filter);

    res.json({
      status: true,
      message: 'Saved categories retrieved successfully',
      data: {
        savedCategories,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + parseInt(limit) < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (err) {
    console.error('Error in getSavedCategories:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get saved category by ID
exports.getSavedCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const savedCategory = await SavedCategories.findById(id)
      .populate({
        path: 'subcategories',
        populate: {
          path: 'category',
          select: 'title slug'
        }
      })
      .populate('createdBy', 'name email');

    if (!savedCategory) {
      return res.status(404).json({ status: false, message: 'Saved category not found', data: {} });
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

// Create new saved category
exports.createSavedCategory = async (req, res) => {
  try {
    const { title, description, subcategories, sortOrder } = req.body;
    const adminId = req.admin.id;

    // Validate subcategories exist
    if (!subcategories || subcategories.length === 0) {
      return res.status(400).json({ 
        status: false, 
        message: 'At least one subcategory must be selected', 
        data: {} 
      });
    }

    // Check if subcategories exist
    const existingSubcategories = await Subcategory.find({
      _id: { $in: subcategories },
      isDeleted: false
    });

    if (existingSubcategories.length !== subcategories.length) {
      return res.status(400).json({
        status: false,
        message: 'Some selected subcategories do not exist',
        data: {}
      });
    }

    const savedCategory = new SavedCategories({
      title,
      description: description || '',
      subcategories,
      sortOrder: sortOrder || 0,
      createdBy: adminId
    });

    await savedCategory.save();

    // Populate the saved category before returning
    const populatedSavedCategory = await SavedCategories.findById(savedCategory._id)
      .populate({
        path: 'subcategories',
        populate: {
          path: 'category',
          select: 'title slug'
        }
      })
      .populate('createdBy', 'name email');

    res.status(201).json({
      status: true,
      message: 'Saved category created successfully',
      data: { savedCategory: populatedSavedCategory }
    });
  } catch (err) {
    console.error('Error in createSavedCategory:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Update saved category
exports.updateSavedCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subcategories, sortOrder, isActive } = req.body;

    const savedCategory = await SavedCategories.findById(id);
    if (!savedCategory) {
      return res.status(404).json({ status: false, message: 'Saved category not found', data: {} });
    }

    // If subcategories are being updated, validate them
    if (subcategories && subcategories.length > 0) {
      const existingSubcategories = await Subcategory.find({
        _id: { $in: subcategories },
        isDeleted: false
      });

      if (existingSubcategories.length !== subcategories.length) {
        return res.status(400).json({
          status: false,
          message: 'Some selected subcategories do not exist',
          data: {}
        });
      }
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (subcategories !== undefined) updateData.subcategories = subcategories;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSavedCategory = await SavedCategories.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({
      path: 'subcategories',
      populate: {
        path: 'category',
        select: 'title slug'
      }
    }).populate('createdBy', 'name email');

    res.json({
      status: true,
      message: 'Saved category updated successfully',
      data: { savedCategory: updatedSavedCategory }
    });
  } catch (err) {
    console.error('Error in updateSavedCategory:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Delete saved category
exports.deleteSavedCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const savedCategory = await SavedCategories.findById(id);
    if (!savedCategory) {
      return res.status(404).json({ status: false, message: 'Saved category not found', data: {} });
    }

    await SavedCategories.findByIdAndDelete(id);

    res.json({
      status: true,
      message: 'Saved category deleted successfully',
      data: {}
    });
  } catch (err) {
    console.error('Error in deleteSavedCategory:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get all subcategories for selection (helper endpoint)
exports.getSubcategoriesForSelection = async (req, res) => {
  try {
    const { category, search = '' } = req.query;

    // Build filter
    const filter = {
      isDeleted: false,
      isSuspended: false
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const subcategories = await Subcategory.find(filter)
      .populate('category', 'title slug')
      .sort({ category: 1, title: 1 })
      .select('title slug category images');

    res.json({
      status: true,
      message: 'Subcategories retrieved successfully',
      data: { subcategories }
    });
  } catch (err) {
    console.error('Error in getSubcategoriesForSelection:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};