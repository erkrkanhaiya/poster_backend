const express = require('express');
const router = express.Router();
const {
  getSavedCategories,
  getSavedCategoryById,
  getTrendingSavedCategories
} = require('./savedCategories.controller');

/**
 * @swagger
 * /users/saved-categories:
 *   get:
 *     summary: Get saved categories for mobile app
 *     tags: [User Saved Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title
 *     responses:
 *       200:
 *         description: Saved categories retrieved successfully
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
 *                     savedCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           subcategories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 title:
 *                                   type: string
 *                                 slug:
 *                                   type: string
 *                                 images:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                 category:
 *                                   type: object
 *                                   properties:
 *                                     _id:
 *                                       type: string
 *                                     title:
 *                                       type: string
 *                                     slug:
 *                                       type: string
 *                           sortOrder:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     totalSavedCategories:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     page:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     serialNumberStartFrom:
 *                       type: number
 *                     hasPrevPage:
 *                       type: boolean
 *                     hasNextPage:
 *                       type: boolean
 *                     prevPage:
 *                       type: number
 *                     nextPage:
 *                       type: number
 *       500:
 *         description: Server error
 */
router.get('/', getSavedCategories);

/**
 * @swagger
 * /users/saved-categories/trending:
 *   get:
 *     summary: Get trending saved categories
 *     tags: [User Saved Categories]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of trending categories to return
 *     responses:
 *       200:
 *         description: Trending saved categories retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/trending', getTrendingSavedCategories);

/**
 * @swagger
 * /users/saved-categories/{id}:
 *   get:
 *     summary: Get saved category by ID
 *     tags: [User Saved Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved category ID
 *     responses:
 *       200:
 *         description: Saved category retrieved successfully
 *       404:
 *         description: Saved category not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getSavedCategoryById);

module.exports = router;