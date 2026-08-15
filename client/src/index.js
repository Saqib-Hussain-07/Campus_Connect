import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { initClientSentry, Sentry } from './services/sentry';

// Initialize frontend Sentry tracking
initClientSentry();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center', background: '#fafaf8' }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: '#c94f2c' }}>{error?.message || 'An unexpected client error occurred.'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Reload CampusConnect
          </button>
        </div>
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
