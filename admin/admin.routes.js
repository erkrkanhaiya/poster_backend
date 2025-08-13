const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile, updateAdminProfile, logout, createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, createAdmin, getBanners, getBannerById, createBanner, updateBanner, deleteBanner, uploadBannerImages, refreshToken } = require('./admin.controller');
const adminAuth = require('../middleware/adminAuth');
const { adminLoginValidation, profileValidation, passwordUpdateValidation } = require('../middleware/validation');
const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@admin.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', adminLoginValidation, validate, adminLogin);

/**
 * @swagger
 * /api/v1/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile
 *       404:
 *         description: Admin not found
 */
router.get('/profile', adminAuth, getAdminProfile);

/**
 * @swagger
 * /api/v1/admin/profile:
 *   put:
 *     summary: Update admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated admin profile
 *       404:
 *         description: Admin not found
 */
router.put('/profile', adminAuth, [...profileValidation, ...passwordUpdateValidation], validate, updateAdminProfile);

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/v1/admin/category:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin]
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
 *             properties:
 *               title:
 *                 type: string
 *                 description: Category title
 *                 example: "Guru Purnima"
 *               slug:
 *                 type: string
 *                 description: Category slug (optional, auto-generated if not provided)
 *                 example: "guru-purnima"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/category', adminAuth, createCategory);

/**
 * @swagger
 * /api/v1/admin/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/category', adminAuth, getCategories);

/**
 * @swagger
 * /api/v1/admin/category/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
router.get('/category/:id', adminAuth, getCategoryById);

/**
 * @swagger
 * /api/v1/admin/category/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Category title
 *                 example: "Updated Guru Purnima"
 *               slug:
 *                 type: string
 *                 description: Category slug
 *                 example: "updated-guru-purnima"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
router.put('/category/:id', adminAuth, updateCategory);

/**
 * @swagger
 * /api/v1/admin/category/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/category/:id', adminAuth, deleteCategory);

/**
 * @swagger
 * /api/v1/admin/banner:
 *   post:
 *     summary: Create a new banner
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Banner created
 *       400:
 *         description: Validation error
 */
router.post('/banner', adminAuth, uploadBannerImages, createBanner);

/**
 * @swagger
 * /api/v1/admin/banner:
 *   get:
 *     summary: Get all banners
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banners fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/banner', adminAuth, getBanners);

/**
 * @swagger
 * /api/v1/admin/banner/{id}:
 *   get:
 *     summary: Get banner by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner fetched successfully
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 */
router.get('/banner/:id', adminAuth, getBannerById);

/**
 * @swagger
 * /api/v1/admin/banner/{id}:
 *   put:
 *     summary: Update banner
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 */
router.put('/banner/:id', adminAuth, updateBanner);

/**
 * @swagger
 * /api/v1/admin/banner/{id}:
 *   delete:
 *     summary: Delete banner
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/banner/:id', adminAuth, deleteBanner);

/**
 * @swagger
 * /api/v1/admin/banner/{bannerId}/image:
 *   post:
 *     summary: Upload banner images
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 */
router.post('/banner/:bannerId/image', adminAuth, uploadBannerImages, (req, res) => {
  // Handle image upload logic
  res.json({ status: true, message: 'Images uploaded successfully' });
});

/**
 * @swagger
 * /api/v1/admin/create-admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: Admin password (minimum 6 characters)
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Validation error or email already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/create-admin', adminAuth, createAdmin);

/**
 * @swagger
 * /api/v1/admin/refresh-token:
 *   post:
 *     summary: Refresh admin token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/refresh-token', adminAuth, refreshToken);

module.exports = router; 