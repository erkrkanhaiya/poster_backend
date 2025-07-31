const { generateImageUploadUrl } = require('../utils/simpleSignedUrl');

// Generate signed URL for image upload
exports.getUploadUrl = async (req, res) => {
  const { fileName, contentType } = req.body;

  try {
    // Validate required fields
    if (!fileName || !contentType) {
      return res.status(400).json({
        status: false,
        message: 'File name and content type are required',
        data: {}
      });
    }

    // Generate signed URL
    const result = await generateImageUploadUrl(fileName, contentType, 'uploads');

    if (!result.success) {
      return res.status(400).json({
        status: false,
        message: result.error,
        data: {}
      });
    }

    res.json({
      status: true,
      message: 'Upload URL generated successfully',
      data: {
        uploadUrl: result.uploadUrl,
        fileName: result.fileName
      }
    });

  } catch (error) {
    console.error('Error in getUploadUrl:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      data: {}
    });
  }
}; 