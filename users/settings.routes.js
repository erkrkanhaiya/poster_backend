const express = require('express');
const router = express.Router();
const { getPublicSettings, checkAppVersion } = require('./settings.controller');

/**
 * @swagger
 * /users/settings:
 *   get:
 *     summary: Get public app settings (for client apps)
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Public settings
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
 */
router.get('/', getPublicSettings);

/**
 * @swagger
 * /users/settings/check-version:
 *   post:
 *     summary: Check app version (public endpoint)
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentVersion
 *             properties:
 *               currentVersion:
 *                 type: string
 *                 description: Current app version
 *                 example: "1.1.0"
 *               platform:
 *                 type: string
 *                 description: Platform (android/ios)
 *                 example: "android"
 *     responses:
 *       200:
 *         description: Version check completed
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
 *                     currentVersion:
 *                       type: string
 *                     latestVersion:
 *                       type: string
 *                     minVersion:
 *                       type: string
 *                     needsUpdate:
 *                       type: boolean
 *                     needsForceUpdate:
 *                       type: boolean
 *                     isMaintenance:
 *                       type: boolean
 *                     maintenanceMessage:
 *                       type: string
 *                     updateMessage:
 *                       type: string
 *                     playStoreUrl:
 *                       type: string
 *                     appStoreUrl:
 *                       type: string
 *       400:
 *         description: Current version is required
 */
router.post('/check-version', checkAppVersion);

module.exports = router; 