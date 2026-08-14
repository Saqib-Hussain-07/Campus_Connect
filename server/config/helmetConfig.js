/**
 * Comprehensive Helmet and Content Security Policy (CSP) Configuration
 * Protects against XSS, clickjacking, MIME sniffing, and cross-origin injection.
 */

const isProduction = process.env.NODE_ENV === 'production';

const helmetConfig = {
  // Cross-Origin isolation and sharing policies
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginEmbedderPolicy: false,

  // Referrer Policy: sends full URL for same-origin, origin only for cross-origin
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // HTTP Strict Transport Security (HSTS)
  hsts: isProduction
    ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      }
    : false,

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // X-Frame-Options: Clickjacking protection
  frameguard: { action: 'deny' },

  // X-Content-Type-Options: MIME sniffing protection
  noSniff: true,

  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Content Security Policy (CSP) Directives
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com'
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
        'https://fonts.googleapis.com'
      ],
      styleSrcElem: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
        'https://fonts.googleapis.com'
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net',
        'data:'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://images.unsplash.com',
        'https://picsum.photos',
        'https://api.dicebear.com',
        'https://cdn.jsdelivr.net',
        'https:'
      ],
      connectSrc: [
        "'self'",
        'http://localhost:*',
        'ws://localhost:*',
        'wss://localhost:*',
        'https://campus-connect-backend-qeqy.onrender.com',
        'https:'
      ],
      mediaSrc: ["'self'", 'data:', 'blob:', 'https:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      ...(isProduction ? { upgradeInsecureRequests: [] } : {})
    }
  }
};

module.exports = helmetConfig;
