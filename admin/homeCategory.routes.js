const express = require('express');
const router = express.Router();
const { addHomeCategories, getHomeCategories, updateHomeCategory, deleteHomeCategory, toggleSuspendHomeCategory } = require('./homeCategory.controller');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /api/v1/admin/home-categories:
 *   post:
 *     summary: Add categories to home page (array of category IDs)
 *     tags: [Admin - Home Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryIds
 *             properties:
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of category IDs to add to home page
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       201:
 *         description: Categories added to home page successfully
 *       400:
 *         description: Categories already exist or validation error
 *       404:
 *         description: One or more categories not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', adminAuth, addHomeCategories);

/**
 * @swagger
 * /api/v1/admin/home-categories:
 *   get:
 *     summary: Get all home categories
 *     tags: [Admin - Home Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Home categories fetched successfully
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
 *                     categoryIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of category IDs for frontend
 *                     homeCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           categoryId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                           isSuspended:
 *                             type: boolean
 *                           addedBy:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', adminAuth, getHomeCategories);

/**
 * @swagger
 * /api/v1/admin/home-categories/{id}:
 *   put:
 *     summary: Update home category
 *     tags: [Admin - Home Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Home category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isSuspended:
 *                 type: boolean
 *                 description: Suspend status
 *                 example: false
 *     responses:
 *       200:
 *         description: Home category updated successfully
 *       404:
 *         description: Home category not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', adminAuth, updateHomeCategory);

/**
 * @swagger
 * /api/v1/admin/home-categories/{id}:
 *   delete:
 *     summary: Delete home category (soft delete)
 *     tags: [Admin - Home Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Home category ID
 *     responses:
 *       200:
 *         description: Home category deleted successfully
 *       404:
 *         description: Home category not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', adminAuth, deleteHomeCategory);

/**
 * @swagger
 * /api/v1/admin/home-categories/{id}/toggle-suspend:
 *   patch:
 *     summary: Toggle suspend/unsuspend home category
 *     tags: [Admin - Home Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Home category ID
 *     responses:
 *       200:
 *         description: Home category suspend status toggled successfully
 *       404:
 *         description: Home category not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/toggle-suspend', adminAuth, toggleSuspendHomeCategory);

module.exports = router; 