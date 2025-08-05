const Banner = require('../common/banner.model');
const User = require('../common/users.model');
const Download = require('../common/download.model');
const Category = require('../common/category.model');
const HomeCategory = require('../common/homeCategory.model');

// Get banners filtered by categoryId or from home categories when "all" is selected
exports.getBanners = async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on categoryId filter
    const query = { };
    
    if (categoryId && categoryId !== 'all') {
      // Specific category filter
      query.category = categoryId;
    } else if (categoryId === 'all') {
      // Get banners from all home categories
      const homeCategories = await HomeCategory.find({ isSuspended: false });
      const homeCategoryIds = homeCategories.map(hc => hc.categoryId);
      
      if (homeCategoryIds.length > 0) {
        query.category = { $in: homeCategoryIds };
      } else {
        // If no home categories, return empty
        return res.json({ 
          status: true, 
          message: 'No home categories available', 
          data: { 
            banners: [],
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 0,
              pages: 0
            }
          } 
        });
      }
    }
    // If no categoryId provided, show all banners
console.log("query",query)
    // Get banners
    const banners = await Banner.find(query)
      .populate('category', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get download counts for each banner
    const bannersWithDownloads = await Promise.all(
      banners.map(async (banner) => {
        const downloadCount = await Download.countDocuments({ bannerId: banner._id });
        return {
          ...banner.toObject(),
          downloadCount
        };
      })
    );

    const total = await Banner.countDocuments(query);

    res.json({ 
      status: true, 
      message: 'Banners fetched successfully', 
      data: { 
        banners: bannersWithDownloads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      } 
    });

  } catch (error) {
    console.error('Error in getBanners:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
};

// Get categories with banner counts and all banners when "All" is selected
exports.getCategoriesWithBannerCounts = async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get all categories with banner counts
    const categoriesWithCounts = await Category.aggregate([
      {
        $lookup: {
          from: 'banners',
          localField: '_id',
          foreignField: 'category',
          as: 'banners'
        }
      },
      {
        $addFields: {
          bannerCount: {
            $size: {
              $filter: {
                input: '$banners',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          bannerCount: 1
        }
      },
      {
        $sort: { bannerCount: -1 }
      }
    ]);

    // Build query for banners
    let bannerQuery = {  };
    
    // If categoryId is provided, filter by that category
    if (categoryId) {
      bannerQuery.category = categoryId;
    }

    // Get banners based on query
    const banners = await Banner.find(bannerQuery)
      .populate('category', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get download counts for each banner
    const bannersWithDownloads = await Promise.all(
      banners.map(async (banner) => {
        const downloadCount = await Download.countDocuments({ bannerId: banner._id });
        return {
          ...banner.toObject(),
          downloadCount
        };
      })
    );

    const totalBanners = await Banner.countDocuments(bannerQuery);

    res.json({ 
      status: true, 
      message: 'Categories with banner counts fetched successfully', 
      data: { 
        categories: categoriesWithCounts,
        banners: bannersWithDownloads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalBanners,
          pages: Math.ceil(totalBanners / limit)
        }
      } 
    });

  } catch (error) {
    console.error('Error in getCategoriesWithBannerCounts:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
};

// Get trending banners (most downloaded in recent time)
exports.getTrendingBanners = async (req, res) => {
  try {
    const { page = 1, limit = 20, days = 7 } = req.query;
    const skip = (page - 1) * limit;

    // Calculate date for trending period (last X days)
    const trendingDate = new Date();
    trendingDate.setDate(trendingDate.getDate() - parseInt(days));

    // Get trending banners based on downloads in recent period
    const trendingDownloads = await Download.aggregate([
      {
        $match: {
          downloadedAt: { $gte: trendingDate }
        }
      },
      {
        $group: {
          _id: '$bannerId',
          totalDownloads: { $sum: '$downloadCount' }
        }
      },
      {
        $sort: { totalDownloads: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Get banner details for trending banners
    const bannerIds = trendingDownloads.map(item => item._id);
    const banners = await Banner.find({
      _id: { $in: bannerIds },
      isActive: true
    })
    .populate('category', 'title slug')
    .sort({ createdAt: -1 });

    // Combine banner data with download counts
    const bannersWithDownloads = banners.map(banner => {
      const downloadData = trendingDownloads.find(d => d._id.toString() === banner._id.toString());
      return {
        ...banner.toObject(),
        downloadCount: downloadData ? downloadData.totalDownloads : 0
      };
    });

    // Get total count for pagination
    const totalDownloads = await Download.aggregate([
      {
        $match: {
          downloadedAt: { $gte: trendingDate }
        }
      },
      {
        $group: {
          _id: '$bannerId'
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalDownloads.length > 0 ? totalDownloads[0].total : 0;

    res.json({ 
      status: true, 
      message: 'Trending banners fetched successfully', 
      data: { 
        banners: bannersWithDownloads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      } 
    });

  } catch (error) {
    console.error('Error in getTrendingBanners:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
};

// Record banner download
exports.downloadBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const userId = req.user.id;

    // Check if banner exists
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ 
        status: false, 
        message: 'Banner not found', 
        data: {} 
      });
    }

    // Check if user already downloaded this banner
    let downloadRecord = await Download.findOne({ 
      bannerId, 
      userId 
    });

    if (downloadRecord) {
      // Increment download count
      downloadRecord.downloadCount += 1;
      downloadRecord.downloadedAt = new Date();
      await downloadRecord.save();
    } else {
      // Create new download record
      downloadRecord = new Download({
        bannerId,
        userId,
        downloadCount: 1
      });
      await downloadRecord.save();
    }

    // Get updated download count for this banner
    const totalDownloads = await Download.aggregate([
      {
        $match: { bannerId: banner._id }
      },
      {
        $group: {
          _id: '$bannerId',
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]);

    const downloadCount = totalDownloads.length > 0 ? totalDownloads[0].totalDownloads : 0;

    res.json({ 
      status: true, 
      message: 'Banner download recorded successfully', 
      data: { 
        bannerId,
        downloadCount,
        userDownloadCount: downloadRecord.downloadCount
      } 
    });

  } catch (error) {
    console.error('Error in downloadBanner:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
}; 

// Get banner details by banner ID
exports.getBannerDetail = async (req, res) => {
  try {
    const { bannerId } = req.params;

    // Check if banner exists and get details
    const banner = await Banner.findById(bannerId)
      .populate('category', 'title slug')
      .populate('subcategory', 'title slug');

    if (!banner) {
      return res.status(404).json({ 
        status: false, 
        message: 'Banner not found', 
        data: {} 
      });
    }

    // Get download count for this banner
    const downloadCount = await Download.countDocuments({ bannerId: banner._id });

    // Get user's download count for this banner (if user is authenticated)
    let userDownloadCount = 0;
    if (req.user && req.user.id) {
      const userDownload = await Download.findOne({ 
        bannerId: banner._id, 
        userId: req.user.id 
      });
      userDownloadCount = userDownload ? userDownload.downloadCount : 0;
    }

    // Prepare banner data with download information
    const bannerData = {
      ...banner.toObject(),
      downloadCount,
      userDownloadCount
    };

    res.json({ 
      status: true, 
      message: 'Banner details fetched successfully', 
      data: { 
        banner: bannerData
      } 
    });

  } catch (error) {
    console.error('Error in getBannerDetail:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      data: {} 
    });
  }
}; 