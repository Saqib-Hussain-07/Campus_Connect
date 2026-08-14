const { body } = require('express-validator');
const validate = require('./validate');

const createGroupRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Group name is required')
    .isLength({ min: 3, max: 150 }).withMessage('Group name must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Group description is required')
    .isLength({ max: 3000 }).withMessage('Description cannot exceed 3000 characters'),
  body('type')
    .optional()
    .isIn(['study', 'project', 'forum']).withMessage('Invalid group type. Must be study, project, or forum'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  validate
];

module.exports = {
  createGroupRules
};
