const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  let token = authHeader ? authHeader.replace('Bearer ', '') : null;

  if (!token && req.cookies) {
    token = req.cookies.token || req.cookies.accessToken;
  }

  if (!token) {
    return sendError(res, 'No authentication token provided, authorization denied', 401);
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('FATAL: JWT_SECRET environment variable is missing.');
      return sendError(res, 'Internal server authentication error', 500);
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { id: user._id }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Access token has expired', 401, { code: 'TOKEN_EXPIRED' });
    }
    return sendError(res, 'Invalid authentication token', 401);
  }
};
