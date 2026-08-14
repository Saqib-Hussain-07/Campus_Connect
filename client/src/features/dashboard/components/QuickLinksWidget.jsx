import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickLinksWidget() {
  const links = [
    { to: '/projects', label: 'Explore Projects', icon: 'fa-cubes', color: 'var(--rust)' },
    { to: '/groups', label: 'Study Circles & Clubs', icon: 'fa-users', color: 'var(--sky)' },
    { to: '/events', label: 'Upcoming Hackathons', icon: 'fa-calendar-check', color: 'var(--moss)' },
    { to: '/resources', label: 'Resource Library', icon: 'fa-book', color: '#7c3aed' },
    { to: '/leaderboard', label: 'Campus Leaderboard', icon: 'fa-trophy', color: 'var(--gold)' },
    { to: '/search', label: 'Universal Search', icon: 'fa-magnifying-glass', color: 'var(--ink)' }
  ];

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
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888', marginBottom: '2px' }}>
        Campus Navigation
      </div>
      <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '16px' }}>
        Quick Links
      </h5>

      <div className="d-flex flex-column gap-2">
        {links.map((lnk, idx) => (
          <Link
            key={idx}
            to={lnk.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              border: '1px solid #e0d8c8',
              background: 'var(--paper)',
              color: 'var(--ink)',
              textDecoration: 'none',
              fontSize: '.82rem',
              fontWeight: '600',
              transition: 'background 0.15s ease, border-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = 'var(--ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--paper)';
              e.currentTarget.style.borderColor = '#e0d8c8';
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className={`fas ${lnk.icon}`} style={{ color: lnk.color, width: '18px' }}></i>
              <span>{lnk.label}</span>
            </div>
            <i className="fas fa-chevron-right" style={{ fontSize: '.7rem', color: '#aaa' }}></i>
          </Link>
        ))}
      </div>
    </div>
  );
}
