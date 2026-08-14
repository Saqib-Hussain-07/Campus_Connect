/**
 * Standardized API Response Wrappers
 * Enforces structured success and error envelopes:
 * Success: { success: true, message: string, data: any, ... }
 * Error:   { success: false, error: { code: string, message: string, details?: any }, message: string }
 */

const getErrorCode = (statusCode, explicitCode, message) => {
  if (explicitCode && typeof explicitCode === 'string') {
    return explicitCode;
  }

  if (message) {
    const msg = message.toLowerCase();
    if (msg.includes('user not found')) return 'USER_NOT_FOUND';
    if (msg.includes('project not found')) return 'PROJECT_NOT_FOUND';
    if (msg.includes('event not found')) return 'EVENT_NOT_FOUND';
    if (msg.includes('group not found')) return 'GROUP_NOT_FOUND';
    if (msg.includes('notice not found')) return 'NOTICE_NOT_FOUND';
    if (msg.includes('resource not found')) return 'RESOURCE_NOT_FOUND';
    if (msg.includes('token expired') || msg.includes('token has expired')) return 'TOKEN_EXPIRED';
    if (msg.includes('invalid token') || msg.includes('unauthorized') || msg.includes('login required')) return 'UNAUTHORIZED';
    if (msg.includes('forbidden') || msg.includes('access denied') || msg.includes('unauthorized to')) return 'FORBIDDEN';
    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) return 'CONFLICT';
    if (msg.includes('validation')) return 'VALIDATION_ERROR';
    if (msg.includes('rate limit') || msg.includes('too many')) return 'RATE_LIMIT_EXCEEDED';
    if (msg.includes('lockout') || msg.includes('locked')) return 'ACCOUNT_LOCKED';
  }

  switch (statusCode) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 422: return 'UNPROCESSABLE_ENTITY';
    case 429: return 'RATE_LIMIT_EXCEEDED';
    default: return 'INTERNAL_SERVER_ERROR';
  }
};

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = undefined) => {
  let response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
    if (typeof data === 'object' && !Array.isArray(data)) {
      // Spread object properties to top-level for direct access compatibility
      response = { ...data, ...response };
    }
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendPaginated = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit) || 1;

  res.setHeader('X-Total-Count', total);
  res.setHeader('X-Total-Pages', totalPages);
  res.setHeader('X-Current-Page', page);
  res.setHeader('X-Page-Limit', limit);

  if (Array.isArray(data)) {
    return res.status(200).json(data);
  }

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalItems: Number(total),
      totalPages
    }
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errorCode = null, errors = null) => {
  // Support polymorphic signature: sendError(res, message, statusCode, errors)
  let details = errors;
  let code = errorCode;
  if (Array.isArray(errorCode) || (typeof errorCode === 'object' && errorCode !== null)) {
    details = errorCode;
    code = null;
  }

  const resolvedCode = getErrorCode(statusCode, code, message);

  const response = {
    success: false,
    error: {
      code: resolvedCode,
      message,
      ...(details ? { details } : {})
    },
    // Top-level message preserved for backwards compatibility with any direct res.message readers
    message,
    ...(details ? { errors: details } : {})
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError
};
