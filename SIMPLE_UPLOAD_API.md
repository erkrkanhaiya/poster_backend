# Simple Image Upload API

## Overview

This is a simplified API that generates signed URLs for direct image uploads to AWS S3 using PUT method.

## API Endpoint

**POST** `/api/v1/users/upload-url`

## Authentication

✅ **Required** - Bearer Token in Authorization header

## Request

### Headers
```
Authorization: Bearer your-jwt-token
Content-Type: application/json
```

### Body
```json
{
  "fileName": "profile-photo.jpg",
  "contentType": "image/jpeg"
}
```

## Response

### Success (200)
```json
{
  "status": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://your-bucket.s3.amazonaws.com/...",
    "fileName": "123/1703123456789-abc123def.jpg"
  }
}
```

### Error (400)
```json
{
  "status": false,
  "message": "Invalid file type. Only JPG, PNG, GIF, WEBP are allowed.",
  "data": {}
}
```

## Frontend Usage

### JavaScript Example
```javascript
// 1. Get signed URL
const response = await fetch('/api/v1/users/upload-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    fileName: file.name,
    contentType: file.type
  })
});

const { data } = await response.json();

// 2. Upload to S3 using PUT method
const uploadResponse = await fetch(data.uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type
  }
});

if (uploadResponse.ok) {
  console.log('Upload successful!');
  console.log('File name:', data.fileName);
}
```



## File Types Allowed

- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WEBP

## File Naming

Files are automatically renamed to prevent conflicts:
`{userId}/{timestamp}-{random}.{extension}`

Example: `123/1703123456789-abc123def.jpg`

## Environment Variables

Make sure these are set in your `.env` file:

```env
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

## Error Messages

- `"File name and content type are required"` - Missing required fields
- `"Invalid file type. Only JPG, PNG, GIF, WEBP are allowed."` - Unsupported file type
- `"Unauthorized"` - Invalid or missing JWT token
- `"Server error"` - AWS configuration or server error 