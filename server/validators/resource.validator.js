const { body } = require('express-validator');
const validate = require('./validate');

const createResourceRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Resource title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
  body('type')
    .optional()
    .isIn(['notes', 'question_paper', 'book', 'syllabus', 'other']).withMessage('Invalid resource type'),
  body('link')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  validate
];

module.exports = {
  resourceRules: createResourceRules,
  createResourceRules
};
