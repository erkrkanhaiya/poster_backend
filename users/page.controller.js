const Page = require('../common/page.model');

// Get page by slug
exports.getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({ status: false, message: 'Page slug is required', data: {} });
    }

    const page = await Page.findOne({ 
      slug: slug.toLowerCase(),
      isActive: true 
    });

    if (!page) {
      return res.status(404).json({ status: false, message: 'Page not found', data: {} });
    }

    res.json({ 
      status: true, 
      message: 'Page fetched successfully', 
      data: { page } 
    });
  } catch (err) {
    console.error('Error in getPageBySlug:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Get all active pages
exports.getAllPages = async (req, res) => {
  try {
    const pages = await Page.find({ 
      isActive: true 
    }).select('slug title metaTitle metaDescription sortOrder').sort({ sortOrder: 1, title: 1 });

    res.json({ 
      status: true, 
      message: 'Pages fetched successfully', 
      data: { 
        pages,
        total: pages.length
      } 
    });
  } catch (err) {
    console.error('Error in getAllPages:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
}; 