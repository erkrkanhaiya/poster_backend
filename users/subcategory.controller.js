const Subcategory = require('../common/subcategory.model');
const Category = require('../common/category.model');
const User = require('../common/users.model');
const mongoose = require('mongoose');

// Helper function to get personalized subcategories based on user interests
const getPersonalizedSubcategories = async (userId, filter, skip, limit) => {
  try {
    // Validate userId format
    if (!userId || !userId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    
    // Try to get user interests
    const user = await User.findById(userId).select('interests').populate('interests', '_id');
    
    if (user && user.interests && user.interests.length > 0) {
      // User has interests - filter by those categories
      const interestCategoryIds = user.interests
        .map(interest => interest._id)
        .filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/)); // Validate ObjectId format
      
      if (interestCategoryIds.length > 0) {
        filter.category = { $in: interestCategoryIds };
        
        const subcategories = await Subcategory.find(filter)
          .populate('category', 'title slug')
          .sort({ sortOrder: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-isDeleted -isSuspended');
          
        return { subcategories, isPersonalized: true, interestCategories: interestCategoryIds };
      }
    }
    
    return null; // No interests found
  } catch (error) {
    console.error('Error getting personalized subcategories:', error);
    return null; // Fall back to default behavior
  }
};

// Helper function to get trending/popular subcategories as fallback
const getTrendingSubcategories = async (filter, skip, limit) => {
  // Get trending subcategories based on image count, recency, and sort order
  const pipeline = [
    { $match: filter },
    {
      $addFields: {
        imageCount: { $size: { $ifNull: ["$images", []] } },
        recentScore: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] },
            1000 * 60 * 60 * 24 // Convert to days
          ]
        }
      }
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ["$imageCount", 2] }, // Image count weight
            { $divide: [7, { $add: ["$recentScore", 1] }] }, // Recency weight (7 days decay)
            { $multiply: ["$sortOrder", -0.1] } // Sort order weight
          ]
        }
      }
    },
    { $sort: { trendingScore: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 1,
        title: 1,
        slug: 1,
        images: 1,
        sortOrder: 1,
        createdAt: 1,
        updatedAt: 1,
        category: {
          _id: '$category._id',
          title: '$category.title',
          slug: '$category.slug'
        }
      }
    }
  ];

  const subcategories = await Subcategory.aggregate(pipeline);
  return { subcategories };
};

/**
 * @swagger
 * /api/v1/users/subcategories:
 *   get:
 *     summary: Get all subcategories with pagination and filtering
 *     tags: [User - Subcategories]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by specific category ID
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Filter by multiple category IDs (comma-separated)
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
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [english, hindi]
 *         description: Filter images by language
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 url:
 *                                   type: string
 *                                 alt:
 *                                   type: string
 *                                 language:
 *                                   type: string
 *                           sortOrder:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     totalSubCategory:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     serialNumberStartFrom:
 *                       type: integer
 *                     hasPrevPage:
 *                       type: boolean
 *                     hasNextPage:
 *                       type: boolean
 *                     prevPage:
 *                       type: integer
 *                     nextPage:
 *                       type: integer
 *       500:
 *         description: Server error
 */
exports.getSubcategories = async (req, res) => {
  try {
    const { category, categories, page = 1, limit = 20, language } = req.query;
    const skip = (page - 1) * limit;
    
    // Debug logging (remove in production)
    // console.log('API called with params:', { category, categories, page, limit, userId: req.user?.id });
    
    // Build base filter query - only active subcategories
    const filter = { 
      isDeleted: false, 
      isSuspended: false 
    };
    
    let subcategories;
    let personalizationInfo = { isPersonalized: false, fallbackType: 'default' };
    
    // Handle specific category filtering (no personalization)
    if (categories && categories.trim() !== '') {
      // Multiple categories - can be comma-separated string or array
      const categoryArray = Array.isArray(categories) 
        ? categories 
        : categories.split(',').map(id => id.trim()).filter(id => id !== '');
      
      if (categoryArray.length > 0) {
        filter.category = { $in: categoryArray };
        
        subcategories = await Subcategory.find(filter)
          .populate('category', 'title slug')
          .sort({ sortOrder: 1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('-isDeleted -isSuspended');
          
        personalizationInfo.filterType = 'specific_multiple_categories';
      } else {
        // Empty categories - fall through to personalization
        categories = null;
      }
    } else if (category && category.trim() !== '') {
      // Single specific category - no personalization
      filter.category = category.trim();
      
      subcategories = await Subcategory.find(filter)
        .populate('category', 'title slug')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-isDeleted -isSuspended');
        
      personalizationInfo.filterType = 'specific_single_category';
    }
    
    // If no valid category specified (empty, null, or undefined) - apply personalization
    if (!subcategories) {
      // No specific category requested - apply personalization logic
      let personalizedResult = null;
      
      // Try to get personalized results if user is authenticated
      if (req.user && req.user.id) {
        personalizedResult = await getPersonalizedSubcategories(req.user.id, { ...filter }, skip, parseInt(limit));
      }
      
      if (personalizedResult && personalizedResult.subcategories.length > 0) {
        // Use personalized results based on user interests
        subcategories = personalizedResult.subcategories;
        personalizationInfo = {
          isPersonalized: true,
          filterType: 'user_interests',
          interestCategories: personalizedResult.interestCategories
        };
      } else {
        // Fall back to trending/popular subcategories
        const trendingResult = await getTrendingSubcategories({ ...filter }, skip, parseInt(limit));
        subcategories = trendingResult.subcategories;
        personalizationInfo = {
          isPersonalized: false,
          filterType: 'trending_fallback',
          fallbackReason: req.user ? 'no_interests' : 'not_authenticated'
        };
      }
    }

    // Filter images by language if specified
    if (language) {
      subcategories = subcategories.map(subcategory => {
        const filteredSubcategory = subcategory.toObject ? subcategory.toObject() : subcategory;
        filteredSubcategory.images = filteredSubcategory.images.filter(image => 
          image.language === language
        );
        return filteredSubcategory;
      });
    }

    // Get total count based on the same filter logic
    let total;
    if (categories && categories.trim() !== '') {
      const categoryArray = Array.isArray(categories) 
        ? categories 
        : categories.split(',').map(id => id.trim()).filter(id => id !== '');
      if (categoryArray.length > 0) {
        total = await Subcategory.countDocuments({ ...filter, category: { $in: categoryArray } });
      } else {
        // Empty categories - count personalized or trending
        if (personalizationInfo.isPersonalized) {
          const countFilter = { ...filter, category: { $in: personalizationInfo.interestCategories } };
          total = await Subcategory.countDocuments(countFilter);
        } else {
          total = await Subcategory.countDocuments(filter);
        }
      }
    } else if (category && category.trim() !== '') {
      total = await Subcategory.countDocuments({ ...filter, category: category.trim() });
    } else {
      // No category specified - count based on personalization
      if (personalizationInfo.isPersonalized) {
        const countFilter = { ...filter, category: { $in: personalizationInfo.interestCategories } };
        total = await Subcategory.countDocuments(countFilter);
      } else {
        total = await Subcategory.countDocuments(filter);
      }
    }

    const totalPages = Math.ceil(total / limit);
    const currentPage = parseInt(page);
    
    // Calculate pagination metadata
    const serialNumberStartFrom = (currentPage - 1) * parseInt(limit) + 1;
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const prevPage = hasPrevPage ? currentPage - 1 : null;
    const nextPage = hasNextPage ? currentPage + 1 : null;

    res.json({
      status: true,
      message: 'Subcategories retrieved successfully',
      data: {
        data: subcategories,
        totalSubCategory: total,
        limit: parseInt(limit),
        page: currentPage,
        totalPages,
        serialNumberStartFrom,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
        personalization: personalizationInfo
      }
    });

  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ 
      status: false, 
      message: 'Server error while fetching subcategories',
      data: {} 
    });
  }
};

/**
 * @swagger
 * /api/v1/users/subcategories/trending:
 *   get:
 *     summary: Get trending subcategories
 *     tags: [User - Subcategories]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by specific category ID
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Filter by multiple category IDs (comma-separated)
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
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [english, hindi]
 *         description: Filter images by language
 *     responses:
 *       200:
 *         description: Trending subcategories retrieved successfully
 */
exports.getTrendingSubcategories = async (req, res) => {
  try {
    const { category, categories, page = 1, limit = 20, language } = req.query;
    const skip = (page - 1) * limit;
    
    // Build base filter query
    const filter = { 
      isDeleted: false, 
      isSuspended: false 
    };
    
    // Handle category filtering
    let categoryFilter = null;
    if (categories && categories.trim() !== '') {
      const categoryArray = Array.isArray(categories) 
        ? categories 
        : categories.split(',').map(id => id.trim()).filter(id => id !== '');
      
      if (categoryArray.length > 0) {
        filter.category = { $in: categoryArray };
        categoryFilter = categoryArray;
      }
    } else if (category && category.trim() !== '') {
      filter.category = category.trim();
      categoryFilter = category.trim();
    }
    
    // Get trending subcategories using aggregation pipeline
    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          imageCount: { $size: { $ifNull: ["$images", []] } },
          recentScore: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$imageCount", 2] }, // Image count weight
              { $divide: [7, { $add: ["$recentScore", 1] }] }, // Recency weight (7 days decay)
              { $multiply: ["$sortOrder", -0.1] } // Sort order weight
            ]
          }
        }
      },
      { $sort: { trendingScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          images: 1,
          sortOrder: 1,
          createdAt: 1,
          updatedAt: 1,
          category: {
            _id: '$category._id',
            title: '$category.title',
            slug: '$category.slug'
          }
        }
      }
    ];

    let subcategories = await Subcategory.aggregate(pipeline);

    // Filter images by language if specified
    if (language) {
      subcategories = subcategories.map(subcategory => ({
        ...subcategory,
        images: subcategory.images.filter(image => image.language === language)
      }));
    }

    // Get total count for trending
    const total = await Subcategory.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const currentPage = parseInt(page);
    
    // Calculate pagination metadata
    const serialNumberStartFrom = (currentPage - 1) * parseInt(limit) + 1;
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const prevPage = hasPrevPage ? currentPage - 1 : null;
    const nextPage = hasNextPage ? currentPage + 1 : null;

    res.json({
      status: true,
      message: 'Trending subcategories retrieved successfully',
      data: {
        data: subcategories,
        totalSubCategory: total,
        limit: parseInt(limit),
        page: currentPage,
        totalPages,
        serialNumberStartFrom,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
        filters: {
          category: categoryFilter,
          language: language || null
        },
        algorithm: {
          description: 'Trending based on image count, recency, and sort order',
          weights: {
            imageCount: 2,
            recency: '7-day decay',
            sortOrder: -0.1
          }
        }
      }
    });

  } catch (err) {
    console.error('Error fetching trending subcategories:', err);
    res.status(500).json({ 
      status: false, 
      message: 'Server error while fetching trending subcategories',
      data: {} 
    });
  }
};

/**
 * @swagger
 * /api/v1/users/subcategories/search:
 *   get:
 *     summary: Search subcategories by title
 *     tags: [User - Subcategories]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by specific category ID
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Filter by multiple category IDs (comma-separated)
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
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search query is required
 */
exports.searchSubcategories = async (req, res) => {
  try {
    const { q, category, categories, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Search query is required',
        data: {}
      });
    }

    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = {
      isDeleted: false,
      isSuspended: false,
      title: { $regex: q.trim(), $options: 'i' }
    };
    
    // Handle category filtering
    if (categories && categories.trim() !== '') {
      const categoryArray = Array.isArray(categories) 
        ? categories 
        : categories.split(',').map(id => id.trim()).filter(id => id !== '');
      
      if (categoryArray.length > 0) {
        filter.category = { $in: categoryArray };
      }
    } else if (category && category.trim() !== '') {
      filter.category = category.trim();
    }

    const subcategories = await Subcategory.find(filter)
      .populate('category', 'title slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-isDeleted -isSuspended');

    const total = await Subcategory.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: true,
      message: 'Search results retrieved successfully',
      data: {
        data: subcategories,
        totalSubCategory: total,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages,
        searchQuery: q.trim()
      }
    });

  } catch (err) {
    console.error('Error searching subcategories:', err);
    res.status(500).json({ 
      status: false, 
      message: 'Server error while searching subcategories',
      data: {} 
    });
  }
};

/**
 * @swagger
 * /api/v1/users/subcategories/{id}:
 *   get:
 *     summary: Get subcategory by ID
 *     tags: [User - Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [english, hindi]
 *         description: Filter images by language
 *     responses:
 *       200:
 *         description: Subcategory retrieved successfully
 *       404:
 *         description: Subcategory not found
 */
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid subcategory ID',
        data: {}
      });
    }

    let subcategory = await Subcategory.findOne({
      _id: id,
      isDeleted: false,
      isSuspended: false
    }).populate('category', 'title slug').select('-isDeleted -isSuspended');

    if (!subcategory) {
      return res.status(404).json({
        status: false,
        message: 'Subcategory not found',
        data: {}
      });
    }

    // Filter images by language if specified
    if (language) {
      const filteredSubcategory = subcategory.toObject();
      filteredSubcategory.images = filteredSubcategory.images.filter(image => 
        image.language === language
      );
      subcategory = filteredSubcategory;
    }

    res.json({
      status: true,
      message: 'Subcategory retrieved successfully',
      data: { subcategory }
    });

  } catch (err) {
    console.error('Error fetching subcategory:', err);
    res.status(500).json({ 
      status: false, 
      message: 'Server error while fetching subcategory',
      data: {} 
    });
  }
};

/**
 * @swagger
 * /api/v1/users/subcategories/by-category/{categoryId}:
 *   get:
 *     summary: Get subcategories by main category ID
 *     tags: [User - Subcategories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Main Category ID
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
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [english, hindi]
 *         description: Filter images by language
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 */
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, language } = req.query;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid category ID',
        data: {}
      });
    }

    // Build filter query
    const filter = {
      isDeleted: false,
      isSuspended: false,
      category: categoryId
    };

    let subcategories = await Subcategory.find(filter)
      .populate('category', 'title slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-isDeleted -isSuspended');

    // Filter images by language if specified
    if (language) {
      subcategories = subcategories.map(subcategory => {
        const filteredSubcategory = subcategory.toObject();
        filteredSubcategory.images = filteredSubcategory.images.filter(image => 
          image.language === language
        );
        return filteredSubcategory;
      });
    }

    const total = await Subcategory.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const currentPage = parseInt(page);
    
    // Calculate pagination metadata
    const serialNumberStartFrom = (currentPage - 1) * parseInt(limit) + 1;
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const prevPage = hasPrevPage ? currentPage - 1 : null;
    const nextPage = hasNextPage ? currentPage + 1 : null;

    res.json({
      status: true,
      message: 'Subcategories retrieved successfully',
      data: {
        data: subcategories,
        totalSubCategory: total,
        limit: parseInt(limit),
        page: currentPage,
        totalPages,
        serialNumberStartFrom,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
        categoryId
      }
    });

  } catch (err) {
    console.error('Error fetching subcategories by category:', err);
    res.status(500).json({ 
      status: false, 
      message: 'Server error while fetching subcategories by category',
      data: {} 
    });
  }
};