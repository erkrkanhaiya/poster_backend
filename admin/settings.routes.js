const express = require('express');
const router = express.Router();
const { updateSettings } = require('./settings.controller');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /admin/settings:
 *   put:
 *     summary: Update or create app settings (single record)
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isForceUpdate:
 *                 type: boolean
 *                 description: Whether to force app update
 *                 example: false
 *               appVersion:
 *                 type: string
 *                 description: Latest app version
 *                 example: "1.2.0"
 *               isMaintenance:
 *                 type: boolean
 *                 description: Whether app is in maintenance mode
 *                 example: false
 *               maintenanceMessage:
 *                 type: string
 *                 description: Message to show during maintenance
 *                 example: "App is under maintenance. Please try again later."
 *               minVersion:
 *                 type: string
 *                 description: Minimum required app version
 *                 example: "1.0.0"
 *               updateMessage:
 *                 type: string
 *                 description: Message to show when update is required
 *                 example: "Please update your app to the latest version."
 *               playStoreUrl:
 *                 type: string
 *                 description: Play Store URL for Android app
 *                 example: "https://play.google.com/store/apps/details?id=com.example.app"
 *               appStoreUrl:
 *                 type: string
 *                 description: App Store URL for iOS app
 *                 example: "https://apps.apple.com/app/id123456789"
 *     responses:
 *       200:
 *         description: Settings updated successfully
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
 *                     settings:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         isForceUpdate:
 *                           type: boolean
 *                         appVersion:
 *                           type: string
 *                         isMaintenance:
 *                           type: boolean
 *                         maintenanceMessage:
 *                           type: string
 *                         minVersion:
 *                           type: string
 *                         updateMessage:
 *                           type: string
 *                         playStoreUrl:
 *                           type: string
 *                         appStoreUrl:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: No data provided for update
 *       401:
 *         description: Unauthorized
 */
router.put('/', adminAuth, updateSettings);

module.exports = router; 