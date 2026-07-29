import React from 'react';
import Button from './Button';

export default function ErrorState({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred while loading content. Please check your connection and try again.',
  onRetry,
  icon = 'fa-circle-exclamation'
}) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4 text-center my-4">
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          border: '2px solid var(--ink)',
          background: 'var(--white)',
          padding: '36px 24px',
          boxShadow: '6px 6px 0 var(--ink)'
        }}
      >
        <div style={{ fontSize: '2.8rem', color: 'var(--rust)', marginBottom: '16px' }}>
          <i className={`fas ${icon}`}></i>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--ink)', marginBottom: '10px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#555', marginBottom: '24px', lineHeight: '1.6' }}>
          {message}
        </p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <i className="fas fa-arrows-rotate me-2"></i> Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
