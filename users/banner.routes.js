const express = require('express');
const router = express.Router();
const { getBanners, getTrendingBanners, downloadBanner } = require('./banner.controller');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/users/banners:
 *   get:
 *     summary: Get banners for user's interests + selected category
 *     tags: [User - Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Selected category ID (optional - if not provided, shows only user's interests)
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of banners per page
 *     responses:
 *       200:
 *         description: Banners fetched successfully
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
 *                     banners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                           downloadCount:
 *                             type: integer
 *                             description: Number of downloads for this banner
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/', auth, getBanners);

/**
 * @swagger
 * /api/v1/users/banners/trending:
 *   get:
 *     summary: Get trending banners (most downloaded in recent period)
 *     tags: [User - Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of banners per page
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to consider for trending (default: 7 days)
 *     responses:
 *       200:
 *         description: Trending banners fetched successfully
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
 *                     banners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                           downloadCount:
 *                             type: integer
 *                             description: Number of downloads in trending period
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/trending', auth, getTrendingBanners);

/**
 * @swagger
 * /api/v1/users/banners/{bannerId}/download:
 *   post:
 *     summary: Record banner download
 *     tags: [User - Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID to download
 *     responses:
 *       200:
 *         description: Banner download recorded successfully
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
 *                     bannerId:
 *                       type: string
 *                     downloadCount:
 *                       type: integer
 *                       description: Total downloads for this banner
 *                     userDownloadCount:
 *                       type: integer
 *                       description: User's download count for this banner
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Banner not found
 */
router.post('/:bannerId/download', auth, downloadBanner);

module.exports = router; 