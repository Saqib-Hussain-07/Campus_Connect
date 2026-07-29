import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div className="d-flex flex-column gap-3">
        {items.map((_, i) => (
          <div
            key={i}
            style={{
              height: '54px',
              background: 'linear-gradient(90deg, #e8e3d5 25%, #f2ebd9 50%, #e8e3d5 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-shimmer 1.5s infinite',
              border: '1px solid var(--cream)'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="row g-4">
      {items.map((_, i) => (
        <div key={i} className="col-md-6 col-xl-4">
          <div
            style={{
              height: '240px',
              background: 'linear-gradient(90deg, #e8e3d5 25%, #f2ebd9 50%, #e8e3d5 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-shimmer 1.5s infinite',
              border: '1.5px solid var(--ink)',
              padding: '24px'
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
