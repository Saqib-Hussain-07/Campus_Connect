const { sendError } = require('../utils/apiResponse');

/**
 * Middleware to restrict route access strictly to admin users
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  if (req.user.role !== 'admin') {
    return sendError(res, 'Access denied: Admin privileges required', 403, 'FORBIDDEN');
  }

  next();
};

module.exports = { requireAdmin };
