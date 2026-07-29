import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  onClick,
  className = '',
  style = {},
  'aria-label': ariaLabel,
  ...props
}) {
  const variantStyles = {
    primary: {
      background: 'var(--rust)',
      color: 'var(--white)',
      border: '1.5px solid var(--rust)'
    },
    secondary: {
      background: 'var(--ink)',
      color: 'var(--paper)',
      border: '1.5px solid var(--ink)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--ink)',
      border: '1.5px solid var(--ink)'
    },
    danger: {
      background: '#dc3545',
      color: '#fff',
      border: '1.5px solid #dc3545'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink)',
      border: '1.5px solid transparent'
    }
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.75rem' },
    md: { padding: '10px 18px', fontSize: '0.84rem' },
    lg: { padding: '14px 28px', fontSize: '0.95rem' }
  };

  const selectedVariant = variantStyles[variant] || variantStyles.primary;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={`cc-btn ${className}`}
      style={{
        fontFamily: 'var(--font-mono, monospace)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.65 : 1,
        borderRadius: '0',
        transition: 'all 0.2s ease',
        ...selectedVariant,
        ...selectedSize,
        ...style
      }}
      {...props}
    >
      {loading ? (
        <>
          <i className="fas fa-spinner fa-spin me-1" aria-hidden="true"></i>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
