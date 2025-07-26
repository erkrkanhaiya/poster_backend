const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile, updateAdminProfile, logout, createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, createAdmin, getBanners, getBannerById, createBanner, updateBanner, deleteBanner, uploadBannerImages } = require('./admin.controller');
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
 * /admin/login:
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
 * /admin/profile:
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
 * /admin/profile:
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
 * /admin/logout:
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
 * /admin/category:
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
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Slug must be unique
 */
router.post('/category', adminAuth, createCategory);

/**
 * @swagger
 * /admin/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/category', adminAuth, getCategories);

/**
 * @swagger
 * /admin/category/{id}:
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
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/category/:id', adminAuth, getCategoryById);

/**
 * @swagger
 * /admin/category/{id}:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               isSuspended:
 *                 type: boolean
 *               isDeleted:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     alt:
 *                       type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.put('/category/:id', adminAuth, updateCategory);

/**
 * @swagger
 * /admin/category/{id}:
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
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */
router.delete('/category/:id', adminAuth, deleteCategory);

/**
 * @swagger
 * /admin/banner:
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
 * /admin/banner:
 *   get:
 *     summary: Get all banners
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of banners
 */
router.get('/banner', adminAuth, getBanners);

/**
 * @swagger
 * /admin/banner/{id}:
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
 *     responses:
 *       200:
 *         description: Banner details
 *       404:
 *         description: Banner not found
 */
router.get('/banner/:id', adminAuth, getBannerById);

/**
 * @swagger
 * /admin/banner/{id}:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Banner updated
 *       404:
 *         description: Banner not found
 */
router.put('/banner/:id', adminAuth, updateBanner);

/**
 * @swagger
 * /admin/banner/{id}:
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
 *     responses:
 *       200:
 *         description: Banner deleted
 *       404:
 *         description: Banner not found
 */
router.delete('/banner/:id', adminAuth, deleteBanner);

/**
 * @swagger
 * /admin/banner/{bannerId}/image:
 *   delete:
 *     summary: Delete a single image from a banner
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted from banner
 *       404:
 *         description: Banner or image not found
 */
router.delete('/banner/:bannerId/image', adminAuth, require('./admin.controller').deleteBannerImage);

/**
 * @swagger
 * /admin/create-admin:
 *   post:
 *     summary: Create a new admin user (manual)
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
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Admin already exists
 */
router.post('/create-admin', createAdmin);


module.exports = router; 