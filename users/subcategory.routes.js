const express = require('express');
const router = express.Router();
const subcategoryController = require('./subcategory.controller');
const optionalAuth = require('../middleware/optionalAuth');

/**
 * @swagger
 * tags:
 *   name: User - Subcategories
 *   description: User subcategory management endpoints
 */

// Specific routes first (before parameterized routes)
router.get('/trending', subcategoryController.getTrendingSubcategories);
router.get('/search', subcategoryController.searchSubcategories);
router.get('/by-category/:categoryId', subcategoryController.getSubcategoriesByCategory);

// Main subcategories route with optional authentication for personalization
router.get('/', optionalAuth, subcategoryController.getSubcategories);

// Parameterized routes last
router.get('/:id', subcategoryController.getSubcategoryById);

module.exports = router;