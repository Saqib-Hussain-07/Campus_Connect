const { body } = require('express-validator');
const validate = require('./validate');

const contactRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters')
    .escape(),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters')
    .escape(),
  validate
];

const newsletterRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  validate
];

module.exports = {
  contactRules,
  newsletterRules
};
