/**
 * Standardized API Response Wrappers
 * Preserves envelope format while maintaining 100% backward compatibility for client UI components.
 */

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

const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors ? { errors } : {})
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError
};
