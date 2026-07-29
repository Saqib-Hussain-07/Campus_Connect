import React from 'react';

export default function Card({
  children,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  return (
    <div
      className={`cc-card ${className}`}
      onClick={onClick}
      style={{
        background: 'var(--paper)',
        border: '1.5px solid var(--ink)',
        borderRadius: '0',
        padding: '24px',
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
