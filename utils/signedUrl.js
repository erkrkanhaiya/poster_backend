const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
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
  const extension = originalName.split('.').pop();
  return `${userId}/${timestamp}-${randomString}.${extension}`;
};

// Generate signed URL for upload
const generateUploadUrl = async (fileName, contentType, bucket = process.env.AWS_S3_BUCKET) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    return {
      success: true,
      uploadUrl: signedUrl,
      fileName: fileName,
      bucket: bucket
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate signed URL for download/view
const generateDownloadUrl = async (fileName, bucket = process.env.AWS_S3_BUCKET) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    return {
      success: true,
      downloadUrl: signedUrl,
      fileName: fileName
    };
  } catch (error) {
    console.error('Error generating download URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate file type
const validateFileType = (fileName, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) => {
  const extension = fileName.toLowerCase().split('.').pop();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  
  const mimeType = mimeTypes[extension];
  return allowedTypes.includes(mimeType);
};

// Get file size in MB
const getFileSizeInMB = (sizeInBytes) => {
  return (sizeInBytes / (1024 * 1024)).toFixed(2);
};

module.exports = {
  generateFileName,
  generateUploadUrl,
  generateDownloadUrl,
  validateFileType,
  getFileSizeInMB
}; 