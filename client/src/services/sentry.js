import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry on the React Client
 */
export function initClientSentry() {
  const dsn = process.env.REACT_APP_SENTRY_DSN;

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
}

export { Sentry };
