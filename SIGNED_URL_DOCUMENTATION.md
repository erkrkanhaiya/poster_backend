# Signed URL API Documentation

## Overview

This document describes the Signed URL functionality that allows secure file uploads and downloads directly to/from AWS S3 without exposing your AWS credentials to the client.

## Features

- ✅ **Secure Upload URLs** - Generate temporary URLs for direct S3 uploads
- ✅ **Secure Download URLs** - Generate temporary URLs for file access
- ✅ **File Type Validation** - Restrict uploads to allowed file types
- ✅ **File Size Validation** - Prevent oversized file uploads
- ✅ **User Isolation** - Users can only access their own files
- ✅ **Admin & User Support** - Separate APIs for admin and user functionality
- ✅ **Profile Photo Support** - Specialized endpoint for profile photos

## Environment Configuration

Add these variables to your `.env` file:

```env
# AWS S3 Configuration (Required for Signed URL functionality)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

## Admin APIs

### 1. Generate Upload URL (Admin)

**Endpoint:** `POST /api/v1/admin/signed-url/upload`

**Authentication:** Required (Admin Bearer Token)

**Request Body:**
```json
{
  "fileName": "banner-image.jpg",
  "contentType": "image/jpeg",
  "fileSize": 1024000,
  "folder": "banners"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://your-bucket.s3.amazonaws.com/...",
    "fileName": "admin/123/1703123456789-abc123def.jpg",
    "bucket": "your-bucket-name",
    "expiresIn": "1 hour"
  }
}
```

### 2. Generate Download URL (Admin)

**Endpoint:** `GET /api/v1/admin/signed-url/download/{fileName}`

**Authentication:** Required (Admin Bearer Token)

**Response:**
```json
{
  "status": true,
  "message": "Download URL generated successfully",
  "data": {
    "downloadUrl": "https://your-bucket.s3.amazonaws.com/...",
    "fileName": "admin/123/banner-image.jpg",
    "expiresIn": "1 hour"
  }
}
```

### 3. Get Upload Configuration (Admin)

**Endpoint:** `GET /api/v1/admin/signed-url/config`

**Authentication:** Required (Admin Bearer Token)

**Response:**
```json
{
  "status": true,
  "message": "Upload configuration retrieved",
  "data": {
    "maxFileSize": "10MB",
    "allowedTypes": ["JPG", "PNG", "GIF", "WEBP", "PDF", "DOC", "DOCX"],
    "maxFiles": 5,
    "uploadExpiry": "1 hour"
  }
}
```

## User APIs

### 1. Generate Upload URL (User)

**Endpoint:** `POST /api/v1/user/signed-url/upload`

**Authentication:** Required (User Bearer Token)

**Request Body:**
```json
{
  "fileName": "profile-image.jpg",
  "contentType": "image/jpeg",
  "fileSize": 512000,
  "folder": "documents"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://your-bucket.s3.amazonaws.com/...",
    "fileName": "users/456/1703123456789-abc123def.jpg",
    "bucket": "your-bucket-name",
    "expiresIn": "1 hour"
  }
}
```

### 2. Generate Download URL (User)

**Endpoint:** `GET /api/v1/user/signed-url/download/{fileName}`

**Authentication:** Required (User Bearer Token)

**Security:** Users can only access files in their own directory (`users/{userId}/`)

**Response:**
```json
{
  "status": true,
  "message": "Download URL generated successfully",
  "data": {
    "downloadUrl": "https://your-bucket.s3.amazonaws.com/...",
    "fileName": "users/456/profile-image.jpg",
    "expiresIn": "1 hour"
  }
}
```

### 3. Generate Profile Photo Upload URL (User)

**Endpoint:** `POST /api/v1/user/signed-url/profile-photo`

**Authentication:** Required (User Bearer Token)

**Request Body:**
```json
{
  "fileName": "profile-photo.jpg",
  "contentType": "image/jpeg",
  "fileSize": 256000
}
```

**Response:**
```json
{
  "status": true,
  "message": "Profile photo upload URL generated successfully",
  "data": {
    "uploadUrl": "https://your-bucket.s3.amazonaws.com/...",
    "fileName": "users/456/profile/1703123456789-abc123def.jpg",
    "bucket": "your-bucket-name",
    "expiresIn": "1 hour"
  }
}
```

### 4. Get Upload Configuration (User)

**Endpoint:** `GET /api/v1/user/signed-url/config`

**Authentication:** Required (User Bearer Token)

**Response:**
```json
{
  "status": true,
  "message": "Upload configuration retrieved",
  "data": {
    "maxFileSize": "5MB",
    "allowedTypes": ["JPG", "PNG", "GIF", "WEBP"],
    "maxFiles": 3,
    "uploadExpiry": "1 hour"
  }
}
```

## File Upload Limits

| User Type | Max File Size | Allowed Types | Max Files |
|-----------|---------------|---------------|-----------|
| Admin | 10MB | JPG, PNG, GIF, WEBP, PDF, DOC, DOCX | 5 |
| User | 5MB | JPG, PNG, GIF, WEBP | 3 |
| Profile Photo | 2MB | JPG, PNG, GIF, WEBP | 1 |

## File Naming Convention

Files are automatically renamed to prevent conflicts:

- **Admin files:** `admin/{adminId}/{timestamp}-{random}.{extension}`
- **User files:** `users/{userId}/{timestamp}-{random}.{extension}`
- **Profile photos:** `users/{userId}/profile/{timestamp}-{random}.{extension}`

## Client-Side Usage Example

### Frontend JavaScript Example

```javascript
// 1. Get signed URL from your API
const response = await fetch('/api/v1/user/signed-url/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size
  })
});

const { data } = await response.json();

// 2. Upload directly to S3 using the signed URL
const uploadResponse = await fetch(data.uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type
  }
});

if (uploadResponse.ok) {
  console.log('File uploaded successfully!');
  console.log('File name:', data.fileName);
}
```

### React Example

```jsx
import React, { useState } from 'react';

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file) => {
    setUploading(true);
    
    try {
      // Get signed URL
      const urlResponse = await fetch('/api/v1/user/signed-url/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size
        })
      });

      const { data } = await urlResponse.json();

      // Upload to S3
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (uploadResponse.ok) {
        alert('File uploaded successfully!');
        // Save fileName to your database
        console.log('File name:', data.fileName);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => handleFileUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

## Error Handling

### Common Error Responses

**400 - Validation Error:**
```json
{
  "status": false,
  "message": "File name and content type are required",
  "data": {}
}
```

**400 - Invalid File Type:**
```json
{
  "status": false,
  "message": "Invalid file type. Allowed types: JPG, PNG, GIF, WEBP",
  "data": {}
}
```

**400 - File Too Large:**
```json
{
  "status": false,
  "message": "File size must be less than 5MB",
  "data": {}
}
```

**401 - Unauthorized:**
```json
{
  "status": false,
  "message": "Access denied",
  "data": {}
}
```

**403 - Access Denied (User Download):**
```json
{
  "status": false,
  "message": "Access denied. You can only access your own files.",
  "data": {}
}
```

**500 - Server Error:**
```json
{
  "status": false,
  "message": "Failed to generate upload URL",
  "data": { "error": "AWS configuration error" }
}
```

## Security Features

1. **Temporary URLs** - All signed URLs expire after 1 hour
2. **User Isolation** - Users can only access files in their own directory
3. **File Type Validation** - Only allowed file types can be uploaded
4. **File Size Limits** - Prevents oversized file uploads
5. **Authentication Required** - All endpoints require valid JWT tokens
6. **Unique File Names** - Prevents file name conflicts and overwrites

## AWS S3 Bucket Configuration

Ensure your S3 bucket has the following CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Best Practices

1. **Always validate file types** on both client and server
2. **Check file sizes** before generating signed URLs
3. **Store file names** in your database after successful upload
4. **Use appropriate folders** for different file types
5. **Handle upload errors** gracefully
6. **Clean up unused files** periodically
7. **Monitor S3 costs** and set up alerts

## Troubleshooting

### Common Issues

1. **"AWS configuration error"** - Check your AWS credentials and bucket name
2. **"Access denied"** - Verify JWT token is valid and not expired
3. **"File type not allowed"** - Check the allowed file types for your user type
4. **"File too large"** - Reduce file size or increase limits
5. **"URL expired"** - Generate a new signed URL (they expire after 1 hour)

### Debug Steps

1. Check AWS credentials in `.env` file
2. Verify S3 bucket exists and is accessible
3. Ensure proper CORS configuration on S3 bucket
4. Check JWT token validity
5. Verify file type and size before upload 