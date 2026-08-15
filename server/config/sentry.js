const Sentry = require('@sentry/node');

/**
 * Initialize Sentry Error Tracking & Performance Monitoring on Server
 */
const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return { isEnabled: false };
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app })
    ]
  });

  return {
    isEnabled: true,
    requestHandler: Sentry.Handlers.requestHandler(),
    tracingHandler: Sentry.Handlers.tracingHandler(),
    errorHandler: Sentry.Handlers.errorHandler()
  };
};

module.exports = { initSentry, Sentry };
