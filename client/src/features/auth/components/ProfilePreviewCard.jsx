import React from 'react';
import { getAvatarUrl } from '../../../utils/avatar';

export default function ProfilePreviewCard({ form }) {
  const avatarUrl = getAvatarUrl(form.avatar, form.name);

  return (
    <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px', textAlign: 'center' }}>
      <div className="position-relative d-inline-block mb-3">
        <img
          src={avatarUrl}
          style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid var(--ink)' }}
          alt={form.name}
        />
        <span
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '14px',
            height: '14px',
            background: '#22c55e',
            borderRadius: '50%',
            border: '2px solid var(--white)'
          }}
        ></span>
      </div>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', lineHeight: 1, marginBottom: '4px' }}>
        {form.name}
      </h4>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--rust)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>
        {form.department || 'No course set'}
      </div>
      {form.university && (
        <div style={{ fontSize: '.78rem', color: '#888', marginBottom: '12px' }}>
          <i className="fas fa-university me-1" style={{ color: 'var(--rust)' }}></i>
          {form.university}
        </div>
      )}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--moss)', marginBottom: '16px' }}>
        <i className="fas fa-check-circle me-1"></i>Verified Account
      </div>
    </div>
  );
}
