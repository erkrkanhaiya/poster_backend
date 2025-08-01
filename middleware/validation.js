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
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters if provided'),
  body('interests').optional().isArray().withMessage('Interests must be an array if provided'),
  body('interests.*').optional().isMongoId().withMessage('Invalid interest ID'),
  body('profilePhoto').optional().notEmpty().withMessage('Profile photo cannot be empty if provided'),
  body('logo').optional().notEmpty().withMessage('Logo cannot be empty if provided'),
];

exports.passwordUpdateValidation = [
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

exports.adminChangePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
]; 