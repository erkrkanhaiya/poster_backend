const express = require('express');
const router = express.Router();
const { userLoginOrRegister, completeProfile, getUserProfile, updateUserProfile, logout, sendOtp, verifyOtp } = require('./users.controller');
const auth = require('../middleware/auth');
const { userLoginValidation, profileValidation, passwordUpdateValidation } = require('../middleware/validation');
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
 * /users/login:
 *   post:
 *     summary: User login or register
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token and profile status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 isProfileCompleted:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', userLoginValidation, validate, userLoginOrRegister);

/**
 * @swagger
 * /users/complete-profile:
 *   post:
 *     summary: Complete user profile
 *     tags: [User]
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
 *     responses:
 *       200:
 *         description: Profile completed
 *       400:
 *         description: Name and email are required
 */
router.post('/complete-profile', auth, profileValidation, validate, completeProfile);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/profile', auth, getUserProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
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
 *         description: User profile updated
 *       404:
 *         description: User not found
 */
router.put('/profile', auth, updateUserProfile);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: User logout
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

/**
 * @swagger
 * /users/send-otp:
 *   post:
 *     summary: Send OTP to user's phone
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: '+1234567890'
 *     responses:
 *       200:
 *         description: OTP sent
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
 *                     otp:
 *                       type: string
 *                       description: OTP (only in dev mode)
 *       400:
 *         description: Phone is required
 */
router.post('/send-otp', sendOtp);

/**
 * @swagger
 * /users/verify-otp:
 *   post:
 *     summary: Verify OTP and login/register user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: '+1234567890'
 *               otp:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         isProfileCompleted:
 *                           type: boolean
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', verifyOtp);

module.exports = router; 