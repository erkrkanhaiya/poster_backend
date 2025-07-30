const express = require('express');
const router = express.Router();
const { userLoginOrRegister, completeProfile, getUserProfile, updateUserProfile, logout, sendOtp, verifyOtp, getAllUsers, getUserById, refreshToken } = require('./users.controller');
const auth = require('../middleware/auth');
const { userLoginValidation, profileValidation, updateProfileValidation, passwordUpdateValidation } = require('../middleware/validation');
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
 * /api/v1/user/login:
 *   post:
 *     summary: Send OTP for user login or register
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
 *         description: OTP sent successfully
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
 *                     message:
 *                       type: string
 *                       description: Additional message (only in dev mode)
 *       400:
 *         description: Phone number is required
 *       429:
 *         description: Too many requests, please wait
 */
router.post('/login', userLoginValidation, validate, userLoginOrRegister);

/**
 * @swagger
 * /api/v1/user/complete-profile:
 *   post:
 *     summary: Complete user profile with name
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name (required)
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 description: Phone number (required for new users)
 *                 example: "+919999999999"
 *     responses:
 *       200:
 *         description: Profile completed successfully
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
 *                       description: "JWT token generated after profile completion"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         name:
 *                           type: string
 *                         isProfileCompleted:
 *                           type: boolean
 *       400:
 *         description: Validation error or phone number required for new users
 *       404:
 *         description: User not found
 *       409:
 *         description: Phone number already registered
 */
router.post('/complete-profile', profileValidation, validate, completeProfile);

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         interests:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                         profilePhoto:
 *                           type: string
 *                         logo:
 *                           type: string
 *                         isProfileCompleted:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: User not found
 */
router.get('/profile', auth, getUserProfile);

/**
 * @swagger
 /api/v1/user/profile:
 *   put:
 *     summary: Update user profile (all fields optional)
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
 *                 description: User's name (optional)
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email (optional)
 *                 example: "john.updated@example.com"
 *               password:
 *                 type: string
 *                 description: User's password (optional)
 *                 example: "newpassword123"
 *               interests:
 *                 type: array
 *                 description: Array of category IDs for user interests (optional)
 *                 items:
 *                   type: string
 *                   format: mongoId
 *                 example: ["64f8a1b2c3d4e5f6a7b8c9d0", "64f8a1b2c3d4e5f6a7b8c9d1"]
 *               profilePhoto:
 *                 type: string
 *                 format: uri
 *                 description: URL to user's profile photo (optional)
 *                 example: "https://example.com/profile.jpg"
 *               logo:
 *                 type: string
 *                 format: uri
 *                 description: URL to user's logo (optional)
 *                 example: "https://example.com/logo.png"
 *     responses:
 *       200:
 *         description: User profile updated
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         interests:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                         profilePhoto:
 *                           type: string
 *                         logo:
 *                           type: string
 *                         isProfileCompleted:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error or no data provided
 *       404:
 *         description: User not found
 */
router.put('/profile', auth, updateProfileValidation, validate, updateUserProfile);

/**
 * @swagger
 * /api/v1/user/logout:
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
 * /api/v1/user/send-otp:
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
 *                     message:
 *                       type: string
 *                       description: Additional message (only in dev mode)
 *       400:
 *         description: Phone is required
 */
router.post('/send-otp', sendOtp);

/**
 * @swagger
 * /api/v1/user/verify-otp:
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
 *                       nullable: true
 *                       description: "JWT token (null if profile completion required)"
 *                     requiresProfileCompletion:
 *                       type: boolean
 *                       description: "Whether user needs to complete profile"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         interests:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                         profilePhoto:
 *                           type: string
 *                         logo:
 *                           type: string
 *                         isProfileCompleted:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', verifyOtp);

/**
 * @swagger
 * /api/v1/user/all:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
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
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           interests:
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
 *                           profilePhoto:
 *                             type: string
 *                           logo:
 *                             type: string
 *                           isProfileCompleted:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/all', auth, getAllUsers);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                       description: New JWT token (valid for 30 days)
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         isProfileCompleted:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/refresh-token', auth, refreshToken);

module.exports = router; 