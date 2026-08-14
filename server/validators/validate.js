const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Express middleware to validate request results and return structured error response
 */
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

module.exports = validate;
