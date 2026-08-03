const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return sendError(res, 'Validation Failed', 400, formattedErrors);
  }
  next();
};

// Register validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  body('registrationNo').optional().trim().isLength({ max: 50 }).withMessage('Registration number cannot exceed 50 characters'),
  validate
];

// Login validation rules
const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Forgot Password rules
const forgotPasswordRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  validate
];

// Reset Password rules
const resetPasswordRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  validate
];

// Change Password rules
const changePasswordRules = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  validate
];

// Message rules
const messageRules = [
  body('toUser').notEmpty().withMessage('Recipient user ID is required').isMongoId().withMessage('Invalid recipient ID format'),
  body('content').trim().notEmpty().withMessage('Message content cannot be empty').isLength({ max: 5000 }).withMessage('Message content cannot exceed 5000 characters'),
  validate
];

// Project rules
const projectRules = [
  body('title').trim().notEmpty().withMessage('Project title is required').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description').trim().notEmpty().withMessage('Project description is required').isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('category').optional().trim().isLength({ max: 100 }),
  validate
];

// Resource rules
const resourceRules = [
  body('title').trim().notEmpty().withMessage('Resource title is required').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('type').optional().trim(),
  body('link').optional().trim().isURL().withMessage('Must be a valid URL'),
  validate
];

// Contact Form rules (with strict email validation and HTML sanitization/escaping)
const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters').escape(),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters').escape(),
  body('subject').optional().trim().isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters').escape(),
  validate
];

// Newsletter rules (with strict email validation)
const newsletterRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  validate
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  messageRules,
  projectRules,
  resourceRules,
  contactRules,
  newsletterRules
};
