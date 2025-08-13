const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, searchCategories } = require('./category.controller');

/**
 * @swagger
 * /users/categories:
 *   get:
 *     summary: Get all categories for interest selection
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of available categories
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                           title:
 *                             type: string
 *                             example: "Guru Purnima"
 *                           slug:
 *                             type: string
 *                             example: "guru-purnima"
 *                           images:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 url:
 *                                   type: string
 *                                 alt:
 *                                   type: string
 *                     total:
 *                       type: number
 *                       example: 10
 *       500:
 *         description: Server error
 */
router.get('/', getCategories);

/**
 * @swagger
 * /users/categories/search:
 *   get:
 *     summary: Search categories by title
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "guru"
 *     responses:
 *       200:
 *         description: Search results
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           images:
 *                             type: array
 *                     total:
 *                       type: number
 *                     query:
 *                       type: string
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get('/search', searchCategories);

/**
 * @swagger
 * /users/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Category details
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
 *                     category:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         slug:
 *                           type: string
 *                         images:
 *                           type: array
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getCategoryById);

module.exports = router; 