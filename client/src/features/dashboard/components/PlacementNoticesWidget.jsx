import React from 'react';
import { Link } from 'react-router-dom';

export default function PlacementNoticesWidget({ notices = [] }) {
  const categoryColors = {
    placement: { bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe', icon: 'fa-briefcase' },
    internship: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa', icon: 'fa-user-graduate' },
    academic: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', icon: 'fa-graduation-cap' },
    opportunity: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', icon: 'fa-star' },
    urgent: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', icon: 'fa-triangle-exclamation' },
    general: { bg: '#f9fafb', text: '#374151', border: '#e5e7eb', icon: 'fa-bullhorn' }
  };

  return (
    <div
      style={{
        border: '2px solid var(--ink)',
        background: 'var(--white)',
        padding: '24px',
        boxShadow: '3px 3px 0 var(--ink)',
        marginBottom: '24px'
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888' }}>
            Campus Bulletins
          </div>
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', margin: '2px 0 0' }}>
            Notices & Placement
          </h5>
        </div>
        <Link
          to="/notices"
          style={{
            fontSize: '.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--rust)',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
        >
          View All →
        </Link>
      </div>

      {notices && notices.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {notices.map((n, idx) => {
            const cat = (n.category || 'general').toLowerCase();
            const badge = categoryColors[cat] || categoryColors.general;

            return (
              <div
                key={idx}
                style={{
                  border: `1px solid ${badge.border}`,
                  background: badge.bg,
                  padding: '12px 14px',
                  position: 'relative'
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span
                    style={{
                      fontSize: '.62rem',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      color: badge.text,
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <i className={`fas ${badge.icon}`}></i>
                    {cat}
                  </span>
                  {n.isPinned && (
                    <span style={{ fontSize: '.65rem', color: 'var(--rust)' }} title="Pinned announcement">
                      <i className="fas fa-thumbtack"></i> Pinned
                    </span>
                  )}
                </div>

                <h6 style={{ fontWeight: '700', fontSize: '.88rem', margin: '2px 0 4px', color: 'var(--ink)' }}>
                  <Link to="/notices" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                    {n.title}
                  </Link>
                </h6>

                <div style={{ fontSize: '.68rem', color: '#666', fontFamily: 'var(--font-mono)' }}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Active'}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4" style={{ color: '#888', fontSize: '.85rem' }}>
          No active campus notices.
        </div>
      )}
    </div>
  );
}
