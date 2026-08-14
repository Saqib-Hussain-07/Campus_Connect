const { body } = require('express-validator');
const validate = require('./validate');

const createNoticeRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Notice title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body()
    .custom((_, { req }) => {
      const text = req.body.body || req.body.content;
      if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error('Notice body is required');
      }
      if (text.length > 5000) {
        throw new Error('Notice content cannot exceed 5000 characters');
      }
      return true;
    }),
  body('category')
    .optional()
    .isIn(['all', 'opportunity', 'academic', 'internship', 'placement', 'general', 'urgent'])
    .withMessage('Invalid notice category'),
  validate
];

module.exports = {
  createNoticeRules
};
