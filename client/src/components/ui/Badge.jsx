import React from 'react';

export default function Badge({
  children,
  variant = 'rust', // 'rust' | 'moss' | 'gold' | 'sky' | 'dark'
  className = '',
  style = {}
}) {
  const colors = {
    rust: { bg: 'rgba(201, 79, 44, 0.12)', color: 'var(--rust)', border: 'var(--rust)' },
    moss: { bg: 'rgba(45, 74, 62, 0.12)', color: 'var(--moss)', border: 'var(--moss)' },
    gold: { bg: 'rgba(201, 168, 76, 0.15)', color: 'var(--gold)', border: 'var(--gold)' },
    sky: { bg: 'rgba(26, 58, 92, 0.12)', color: 'var(--sky)', border: 'var(--sky)' },
    dark: { bg: 'var(--ink)', color: 'var(--paper)', border: 'var(--ink)' }
  };

  const scheme = colors[variant] || colors.rust;

  return (
    <span
      className={`cc-ui-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        fontSize: '0.68rem',
        fontFamily: 'var(--font-mono, monospace)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 'bold',
        background: scheme.bg,
        color: scheme.color,
        border: `1px solid ${scheme.border}`,
        borderRadius: '0',
        ...style
      }}
    >
      {children}
    </span>
  );
}
