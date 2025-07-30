const express = require('express');
const router = express.Router();
const { 
  testRazorpayConnection,
  createOrder, 
  verifyPayment, 
  getPaymentStatus,
  getTransactionHistory, 
  getSubscriptionStatus 
} = require('./payment.controller');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /users/payment/test:
 *   get:
 *     summary: Test Razorpay connection
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Razorpay connection test result
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
 *                     orderId:
 *                       type: string
 *                     keyId:
 *                       type: string
 *                     environment:
 *                       type: string
 *       500:
 *         description: Connection failed or credentials not configured
 */
router.get('/test', testRazorpayConnection);

/**
 * @swagger
 * /users/payment/create-order:
 *   post:
 *     summary: Create a payment order for fixed amount
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in paise (INR)
 *                 example: 99900
 *               currency:
 *                 type: string
 *                 description: Currency code
 *                 example: "INR"
 *               notes:
 *                 type: string
 *                 description: Additional notes for the order
 *                 example: "Monthly subscription"
 *               description:
 *                 type: string
 *                 description: Payment description
 *                 example: "Premium Subscription"
 *     responses:
 *       200:
 *         description: Order created successfully
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
 *                     order:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "order_123456789"
 *                         amount:
 *                           type: number
 *                           example: 99900
 *                         currency:
 *                           type: string
 *                           example: "INR"
 *                         receipt:
 *                           type: string
 *                           example: "receipt_123456789"
 *                     transactionId:
 *                       type: string
 *                     checkoutUrl:
 *                       type: string
 *                       example: "https://checkout.razorpay.com/v1/checkout.html?key=rzp_test_123&amount=99900&currency=INR&name=Your%20Company&description=Payment&order_id=order_123&prefill[name]=User&prefill[email]=user@example.com&prefill[contact]=9999999999&notes[transactionId]=64f8a1b2c3d4e5f6a7b8c9d0&theme[color]=#667eea"
 *                     description:
 *                       type: string
 *       400:
 *         description: Invalid amount (must be at least ₹1)
 *       401:
 *         description: Unauthorized
 */
router.post('/create-order', auth, createOrder);

/**
 * @swagger
 * /users/payment/verify:
 *   post:
 *     summary: Verify payment and complete transaction
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *               - transactionId
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 description: Razorpay order ID
 *                 example: "order_123456789"
 *               razorpay_payment_id:
 *                 type: string
 *                 description: Razorpay payment ID
 *                 example: "pay_123456789"
 *               razorpay_signature:
 *                 type: string
 *                 description: Razorpay signature for verification
 *                 example: "abc123def456..."
 *               transactionId:
 *                 type: string
 *                 description: Transaction ID from create-order
 *                 example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Payment verified successfully
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
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "completed"
 *                         amount:
 *                           type: number
 *                         subscriptionEndDate:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid signature or payment already verified
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.post('/verify', auth, verifyPayment);

/**
 * @swagger
 * /users/payment/status/{orderId}:
 *   get:
 *     summary: Get payment status by order ID
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Razorpay order ID
 *         example: "order_123456789"
 *     responses:
 *       200:
 *         description: Payment status
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
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "completed"
 *                         amount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                         description:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                         user:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                             phone:
 *                               type: string
 *       404:
 *         description: Transaction not found
 */
router.get('/status/:orderId', getPaymentStatus);

/**
 * @swagger
 * /users/payment/transactions:
 *   get:
 *     summary: Get user's transaction history
 *     tags: [Payment]
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Transaction history
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
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           currency:
 *                             type: string
 *                           status:
 *                             type: string
 *                           plan:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                               duration:
 *                                 type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     totalPages:
 *                       type: number
 *                     currentPage:
 *                       type: number
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/transactions', auth, getTransactionHistory);

/**
 * @swagger
 * /users/payment/subscription:
 *   get:
 *     summary: Get current subscription status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status
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
 *                     hasActiveSubscription:
 *                       type: boolean
 *                     subscription:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         plan:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *                             price:
 *                               type: number
 *                             duration:
 *                               type: number
 *                             features:
 *                               type: array
 *                               items:
 *                                 type: string
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         amount:
 *                           type: number
 *                         status:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/subscription', auth, getSubscriptionStatus);

module.exports = router; 