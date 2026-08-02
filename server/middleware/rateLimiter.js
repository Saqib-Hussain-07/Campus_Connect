const rateLimit = require('express-rate-limit');

// Pass-through or high-limit auth middleware so custom progressive rate limiter handles login lockouts
const authLimiter = (req, res, next) => next();

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour.'
  }
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Rate limiter for contact messages
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 messages per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact messages sent from this IP, please try again after 15 minutes.'
  }
});

// Rate limiter for newsletter subscriptions
const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 subscriptions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many newsletter subscription attempts from this IP, please try again after 15 minutes.'
  }
});

module.exports = {
  authLimiter,
  registerLimiter,
  apiLimiter,
  contactLimiter,
  newsletterLimiter
};
