const cors = require('cors');

const getCorsOptions = () => {
  const defaultOrigins = [
    'https://campus-connect-sigma-six.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];

  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const allowedOriginsSet = new Set([
    ...defaultOrigins.map(o => o.replace(/\/+$/, '')),
    ...envOrigins
  ]);

  const isDev = process.env.NODE_ENV !== 'production';

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      // Check if origin matches allowed list, or local regex ONLY in dev mode
      const isAllowed = allowedOriginsSet.has(normalizedOrigin) ||
        (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });
};

module.exports = getCorsOptions;
