const express = require('express');
const router = express.Router();
const { getPageBySlug, getAllPages } = require('./page.controller');

/**
 * @swagger
 * /users/pages:
 *   get:
 *     summary: Get all active pages
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: List of active pages
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
 *                     pages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           slug:
 *                             type: string
 *                             example: "about-us"
 *                           title:
 *                             type: string
 *                             example: "About Us"
 *                           metaTitle:
 *                             type: string
 *                           metaDescription:
 *                             type: string
 *                           sortOrder:
 *                             type: number
 *                     total:
 *                       type: number
 */
router.get('/', getAllPages);

/**
 * @swagger
 * /users/pages/{slug}:
 *   get:
 *     summary: Get page content by slug
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Page slug (e.g., about-us, privacy-policy)
 *         example: "about-us"
 *     responses:
 *       200:
 *         description: Page content
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
 *                     page:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         slug:
 *                           type: string
 *                           example: "about-us"
 *                         title:
 *                           type: string
 *                           example: "About Us"
 *                         description:
 *                           type: string
 *                           example: "This is the about us page content..."
 *                         metaTitle:
 *                           type: string
 *                           example: "About Us - Our Company"
 *                         metaDescription:
 *                           type: string
 *                           example: "Learn more about our company and mission"
 *                         isActive:
 *                           type: boolean
 *                         sortOrder:
 *                           type: number
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Page not found
 */
router.get('/:slug', getPageBySlug);

module.exports = router; 