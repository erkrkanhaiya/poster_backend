const Subcategory = require('../common/subcategory.model');
const Category = require('../common/category.model');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// S3 config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `subcategories/${Date.now()}_${file.originalname}`);
    }
  })
});

// Middleware for subcategory image upload (multiple)
exports.uploadSubcategoryImages = upload.array('images', 10);

// Upload image endpoint
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No image file provided',
        data: {}
      });
    }

    // Return the first uploaded image URL
    const imageUrl = req.files[0].location;
    
    res.status(200).json({
      status: true,
      message: 'Image uploaded successfully',
      data: { imageUrl }
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({
      status: false,
      message: 'Failed to upload image',
      data: { error: err.message }
    });
  }
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * @swagger
 * /api/v1/admin/subcategories:
 *   get:
 *     summary: Get all subcategories
 *     tags: [Admin - Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by main category ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 */
exports.getAllSubcategories = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = { isDeleted: false };
    if (category) {
      filter.category = category;
    }

    const subcategories = await Subcategory.find(filter)
      .populate('category', 'title slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subcategory.countDocuments(filter);

    res.json({
      status: true,
      message: 'Subcategories retrieved successfully',
      data: {
        subcategories,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch subcategories',
      data: { error: error.message }
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/subcategories/by-category/{categoryId}:
 *   get:
 *     summary: Get subcategories by main category
 *     tags: [Admin - Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Main category ID
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 */
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Category not found',
        data: {}
      });
    }

    const subcategories = await Subcategory.find({ 
      category: categoryId, 
      isDeleted: false 
    })
      .populate('category', 'title slug')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({
      status: true,
      message: 'Subcategories retrieved successfully',
      data: {
        category: {
          _id: category._id,
          title: category.title,
          slug: category.slug
        },
        subcategories,
        total: subcategories.length
      }
    });
  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch subcategories',
      data: { error: error.message }
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/subcategories:
 *   post:
 *     summary: Create a new subcategory
 *     tags: [Admin - Subcategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Subcategory title
 *               category:
 *                 type: string
 *                 description: Main category ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     alt:
 *                       type: string
 *               sortOrder:
 *                 type: number
 *                 description: Sort order for display
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 */
exports.createSubcategory = async (req, res) => {
  try {
    const { title, category, images = [], sortOrder = 0 } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        status: false,
        message: 'Title and category are required',
        data: {}
      });
    }

    // Verify category exists
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({
        status: false,
        message: 'Parent category not found',
        data: {}
      });
    }

    // Generate slug
    const slug = generateSlug(title);

    // Check if slug already exists in this category
    const existingSubcategory = await Subcategory.findOne({ 
      category, 
      slug,
      isDeleted: false 
    });

    if (existingSubcategory) {
      return res.status(409).json({
        status: false,
        message: 'Subcategory with this name already exists in this category',
        data: {}
      });
    }

    const subcategory = new Subcategory({
      title: title.trim(),
      slug,
      category,
      images,
      sortOrder
    });

    await subcategory.save();

    // Populate category info before returning
    await subcategory.populate('category', 'title slug');

    res.status(201).json({
      status: true,
      message: 'Subcategory created successfully',
      data: { subcategory }
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to create subcategory',
      data: { error: error.message }
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/subcategories/{id}:
 *   get:
 *     summary: Get subcategory by ID
 *     tags: [Admin - Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *     responses:
 *       200:
 *         description: Subcategory retrieved successfully
 */
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findOne({ 
      _id: id, 
      isDeleted: false 
    }).populate('category', 'title slug');

    if (!subcategory) {
      return res.status(404).json({
        status: false,
        message: 'Subcategory not found',
        data: {}
      });
    }

    res.json({
      status: true,
      message: 'Subcategory retrieved successfully',
      data: { subcategory }
    });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch subcategory',
      data: { error: error.message }
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/subcategories/{id}:
 *   put:
 *     summary: Update a subcategory
 *     tags: [Admin - Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     alt:
 *                       type: string
 *               isSuspended:
 *                 type: boolean
 *               sortOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 */
exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, images, isSuspended, sortOrder } = req.body;

    const subcategory = await Subcategory.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!subcategory) {
      return res.status(404).json({
        status: false,
        message: 'Subcategory not found',
        data: {}
      });
    }

    // If category is being changed, verify new category exists
    if (category && category !== subcategory.category.toString()) {
      const parentCategory = await Category.findById(category);
      if (!parentCategory) {
        return res.status(404).json({
          status: false,
          message: 'Parent category not found',
          data: {}
        });
      }
    }

    // If title is being changed, generate new slug and check uniqueness
    let updates = {};
    if (title && title !== subcategory.title) {
      const slug = generateSlug(title);
      const categoryToCheck = category || subcategory.category;
      
      const existingSubcategory = await Subcategory.findOne({ 
        category: categoryToCheck, 
        slug,
        isDeleted: false,
        _id: { $ne: id }
      });

      if (existingSubcategory) {
        return res.status(409).json({
          status: false,
          message: 'Subcategory with this name already exists in this category',
          data: {}
        });
      }

      updates.title = title.trim();
      updates.slug = slug;
    }

    // Add other updates
    if (category !== undefined) updates.category = category;
    if (images !== undefined) updates.images = images;
    if (isSuspended !== undefined) updates.isSuspended = isSuspended;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('category', 'title slug');

    res.json({
      status: true,
      message: 'Subcategory updated successfully',
      data: { subcategory: updatedSubcategory }
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to update subcategory',
      data: { error: error.message }
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/subcategories/{id}:
 *   delete:
 *     summary: Delete a subcategory (soft delete)
 *     tags: [Admin - Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully
 */
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!subcategory) {
      return res.status(404).json({
        status: false,
        message: 'Subcategory not found',
        data: {}
      });
    }

    // Soft delete
    subcategory.isDeleted = true;
    await subcategory.save();

    res.json({
      status: true,
      message: 'Subcategory deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to delete subcategory',
      data: { error: error.message }
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/subcategories/{id}/toggle-status:
 *   patch:
 *     summary: Toggle subcategory suspend status
 *     tags: [Admin - Subcategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *     responses:
 *       200:
 *         description: Subcategory status toggled successfully
 */
exports.toggleSubcategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!subcategory) {
      return res.status(404).json({
        status: false,
        message: 'Subcategory not found',
        data: {}
      });
    }

    subcategory.isSuspended = !subcategory.isSuspended;
    await subcategory.save();

    await subcategory.populate('category', 'title slug');

    res.json({
      status: true,
      message: `Subcategory ${subcategory.isSuspended ? 'suspended' : 'activated'} successfully`,
      data: { subcategory }
    });
  } catch (error) {
    console.error('Error toggling subcategory status:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to toggle subcategory status',
      data: { error: error.message }
    });
  }
};