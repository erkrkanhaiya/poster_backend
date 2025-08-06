const express = require('express');
const router = express.Router();
const {
  getSavedCategories,
  getSavedCategoryById,
  createSavedCategory,
  updateSavedCategory,
  deleteSavedCategory,
  getSubcategoriesForSelection
} = require('./savedCategories.controller');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /admin/saved-categories:
 *   get:
 *     summary: Get all saved categories (admin)
 *     tags: [Admin Saved Categories]
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title
 *     responses:
 *       200:
 *         description: Saved categories retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', adminAuth, getSavedCategories);

/**
 * @swagger
 * /admin/saved-categories/subcategories:
 *   get:
 *     summary: Get subcategories for selection
 *     tags: [Admin Saved Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 */
router.get('/subcategories', adminAuth, getSubcategoriesForSelection);

/**
 * @swagger
 * /admin/saved-categories/{id}:
 *   get:
 *     summary: Get saved category by ID
 *     tags: [Admin Saved Categories]
 *     security:
 *       - bearerAuth: []
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
 */
router.get('/:id', adminAuth, getSavedCategoryById);

/**
 * @swagger
 * /admin/saved-categories:
 *   post:
 *     summary: Create new saved category
 *     tags: [Admin Saved Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - subcategories
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the saved category
 *               description:
 *                 type: string
 *                 description: Description of the saved category
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of subcategory IDs
 *               sortOrder:
 *                 type: number
 *                 description: Sort order for display
 *     responses:
 *       201:
 *         description: Saved category created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', adminAuth, createSavedCategory);

/**
 * @swagger
 * /admin/saved-categories/{id}:
 *   put:
 *     summary: Update saved category
 *     tags: [Admin Saved Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               sortOrder:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Saved category updated successfully
 *       404:
 *         description: Saved category not found
 */
router.put('/:id', adminAuth, updateSavedCategory);

/**
 * @swagger
 * /admin/saved-categories/{id}:
 *   delete:
 *     summary: Delete saved category
 *     tags: [Admin Saved Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved category ID
 *     responses:
 *       200:
 *         description: Saved category deleted successfully
 *       404:
 *         description: Saved category not found
 */
router.delete('/:id', adminAuth, deleteSavedCategory);

module.exports = router;