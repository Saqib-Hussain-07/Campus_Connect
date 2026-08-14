const { body } = require('express-validator');
const validate = require('./validate');

const createEventRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('eventDate')
    .custom((value, { req }) => {
      const dateVal = value || req.body.date;
      if (!dateVal) {
        throw new Error('Event date is required');
      }
      if (isNaN(new Date(dateVal).getTime())) {
        throw new Error('Event date must be a valid date');
      }
      return true;
    }),
  body('category')
    .optional()
    .isIn(['hackathon', 'seminar', 'workshop', 'other']).withMessage('Invalid event category'),
  validate
];

const rsvpEventRules = [
  body('status')
    .optional()
    .isIn(['going', 'maybe', 'not_going']).withMessage('Invalid RSVP status'),
  validate
];

module.exports = {
  createEventRules,
  rsvpEventRules
};
