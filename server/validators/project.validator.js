const { body, param } = require('express-validator');
const validate = require('./validate');

const createProjectRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Project description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Invalid GitHub URL'),
  body('liveUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Invalid Live Demo URL'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'planning', 'in-progress']).withMessage('Invalid project status'),
  validate
];

const commentProjectRules = [
  body()
    .custom((_, { req }) => {
      const content = req.body.body || req.body.text;
      if (!content || typeof content !== 'string' || content.trim() === '') {
        throw new Error('Comment body is required');
      }
      if (content.length > 1000) {
        throw new Error('Comment cannot exceed 1000 characters');
      }
      return true;
    }),
  validate
];

const joinRequestRules = [
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Join request message cannot exceed 500 characters'),
  validate
];

module.exports = {
  projectRules: createProjectRules,
  createProjectRules,
  commentProjectRules,
  joinRequestRules
};
