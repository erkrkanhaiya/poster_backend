const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate unique file name
const generateFileName = (originalName, userId) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = originalName.split('.').pop().toLowerCase();
  return `${userId}/${timestamp}-${randomString}.${extension}`;
};

// Validate image file type
const validateImageType = (fileName) => {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = fileName.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

// Generate signed URL for image upload
const generateImageUploadUrl = async (fileName, contentType, userId) => {
  try {
    // Validate file type
    if (!validateImageType(fileName)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPG, PNG, GIF, WEBP are allowed.'
      };
    }

    // Generate unique file name
    const uniqueFileName = generateFileName(fileName, userId);

    // Create PUT command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    // Generate signed URL (1 hour expiry)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      success: true,
      uploadUrl: signedUrl,
      fileName: uniqueFileName,
      bucket: process.env.AWS_BUCKET
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateImageUploadUrl,
  validateImageType
}; 