import React, { useId } from 'react';

export default function Input({
  id,
  label,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  style = {},
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`cc-input-group ${className}`} style={{ marginBottom: '16px', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#666',
            marginBottom: '8px'
          }}
        >
          {label} {required && <span style={{ color: 'var(--rust)' }}>*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        style={{
          background: disabled ? '#eee' : '#fafaf8',
          border: error ? '1.5px solid #dc3545' : '1px solid #d3c9b9',
          padding: '12px 16px',
          fontSize: '0.95rem',
          color: 'var(--ink)',
          width: '100%',
          outline: 'none',
          borderRadius: '0',
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'border-color 0.2s'
        }}
        {...props}
      />

      {error && (
        <div id={`${inputId}-error`} style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
          <i className="fas fa-circle-exclamation me-1" aria-hidden="true"></i>
          {error}
        </div>
      )}
    </div>
  );
}
