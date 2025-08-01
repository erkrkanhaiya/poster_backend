const Banner = require('../common/banner.model');
const User = require('../common/users.model');
const Download = require('../common/download.model');

// Get banners for user's interests + selected category
exports.getBanners = async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    const skip = (page - 1) * limit;

    // Get user's interests
    const user = await User.findById(userId).populate('interests');
    if (!user) {
      return res.status(404).json({ 
        status: false, 
        message: 'User not found', 
        data: {} 
      });
    }

    // Create array of category IDs (user interests + selected category)
    const categoryIds = [];
    
    // Add user's interests
    if (user.interests && user.interests.length > 0) {
      categoryIds.push(...user.interests.map(interest => interest._id));
    }
    
    // Add selected category if provided and not already in user's interests
    if (categoryId && !categoryIds.includes(categoryId)) {
      categoryIds.push(categoryId);
    }

    // If no categories, return empty
    if (categoryIds.length === 0) {
      return res.json({ 
        status: true, 
        message: 'No categories available', 
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

    // Get banners for all relevant categories
    const banners = await Banner.find({ 
      category: { $in: categoryIds },
      isActive: true 
    })
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

    const total = await Banner.countDocuments({ 
      category: { $in: categoryIds },
      isActive: true 
    });

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