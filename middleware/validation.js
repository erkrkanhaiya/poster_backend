const { body } = require('express-validator');

exports.adminLoginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.userLoginValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
];

exports.profileValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required for new users'),
];

exports.updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty if provided'),
  body('email').optional().isEmail().withMessage('Valid email is required if provided'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('interests.*').optional().isMongoId().withMessage('Invalid interest ID'),
  body('profilePhoto').optional().isURL().withMessage('Profile photo must be a valid URL'),
  body('logo').optional().isURL().withMessage('Logo must be a valid URL'),
];

exports.passwordUpdateValidation = [
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]; 