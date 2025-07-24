const { body } = require('express-validator');

exports.adminLoginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.userLoginValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.profileValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

exports.passwordUpdateValidation = [
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]; 