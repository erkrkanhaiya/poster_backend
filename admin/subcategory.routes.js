const express = require('express');
const router = express.Router();
const subcategoryController = require('./subcategory.controller');
const adminAuth = require('../middleware/adminAuth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Get all subcategories with optional category filter
router.get('/', subcategoryController.getAllSubcategories);

// Get subcategories by main category
router.get('/by-category/:categoryId', subcategoryController.getSubcategoriesByCategory);

// Get single subcategory by ID
router.get('/:id', subcategoryController.getSubcategoryById);

// Upload image endpoint (separate from create/update)
router.post('/upload-image', subcategoryController.uploadSubcategoryImages, subcategoryController.uploadImage);

// Create new subcategory (back to original without multer)
router.post('/', subcategoryController.createSubcategory);

// Update subcategory (back to original without multer)
router.put('/:id', subcategoryController.updateSubcategory);

// Toggle subcategory suspend status
router.patch('/:id/toggle-status', subcategoryController.toggleSubcategoryStatus);

// Delete subcategory (soft delete)
router.delete('/:id', subcategoryController.deleteSubcategory);

module.exports = router;