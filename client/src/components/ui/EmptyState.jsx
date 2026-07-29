import React from 'react';
import Button from './Button';

export default function EmptyState({
  title = 'No Items Found',
  description = 'There are no records matching your request right now.',
  icon = 'fa-folder-open',
  actionLabel,
  onAction
}) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center p-5 text-center my-4"
      style={{
        border: '1.5px dashed #ccc',
        background: 'var(--white)',
        padding: '40px 24px'
      }}
    >
      <div style={{ fontSize: '2.5rem', color: '#aaa', marginBottom: '16px' }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', marginBottom: '8px' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.88rem', color: '#666', maxWidth: '400px', lineHeight: '1.5', marginBottom: actionLabel ? '20px' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
