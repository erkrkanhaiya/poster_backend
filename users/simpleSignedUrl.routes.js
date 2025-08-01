const express = require('express');
const router = express.Router();
const { getUploadUrl } = require('./simpleSignedUrl.controller');

/**
 * @swagger
 * /api/v1/users/upload-url:
 *   post:
 *     summary: Get signed URL for image upload
 *     tags: [User - Upload]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - contentType
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Image file name
 *                 example: "profile-photo.jpg"
 *               contentType:
 *                 type: string
 *                 description: MIME type of the image
 *                 example: "image/jpeg"

 *     responses:
 *       200:
 *         description: Upload URL generated successfully
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
 *                     uploadUrl:
 *                       type: string
 *                       description: Signed URL for PUT upload to S3
 *                     fileName:
 *                       type: string
 *                       description: Generated unique file name
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Simple signed URL router is working!' });
});

// Simple test POST route
router.post('/test-post', (req, res) => {
  res.json({ 
    message: 'POST route is working!',
    body: req.body 
  });
});

router.post('/', getUploadUrl);

module.exports = router; 