import React from 'react';

export default function ToastContainer({ toasts = [], removeToast }) {
  if (toasts.length === 0) return null;

  const typeStyles = {
    success: { bg: 'var(--ink)', border: 'var(--moss)', icon: 'fa-circle-check', iconColor: 'var(--moss)' },
    error: { bg: 'var(--ink)', border: 'var(--rust)', icon: 'fa-triangle-exclamation', iconColor: 'var(--rust)' },
    info: { bg: 'var(--ink)', border: 'var(--sky)', icon: 'fa-circle-info', iconColor: 'var(--sky)' }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        const style = typeStyles[toast.type] || typeStyles.info;
        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: style.bg,
              color: '#fff',
              border: `1.5px solid ${style.border}`,
              padding: '12px 16px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
              animation: 'toast-slide-in 0.25s ease-out'
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className={`fas ${style.icon}`} style={{ color: style.iconColor, fontSize: '1rem' }}></i>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ✕
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
