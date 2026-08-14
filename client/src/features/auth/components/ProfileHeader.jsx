import React from 'react';

export default function ProfileHeader({ title = 'Update Profile', subtitle = 'Edit Information' }) {
  return (
    <div className="mb-4">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>
        {subtitle}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', margin: 0 }}>
        {title}
      </h3>
    </div>
  );
}
