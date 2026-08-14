const { body } = require('express-validator');
const validate = require('./validate');

const sendMessageRules = [
  body('toUser')
    .notEmpty().withMessage('Recipient user ID is required')
    .isMongoId().withMessage('Invalid recipient ID format'),
  body('content')
    .trim()
    .notEmpty().withMessage('Message content cannot be empty')
    .isLength({ max: 5000 }).withMessage('Message content cannot exceed 5000 characters'),
  validate
];

module.exports = {
  messageRules: sendMessageRules,
  sendMessageRules
};
