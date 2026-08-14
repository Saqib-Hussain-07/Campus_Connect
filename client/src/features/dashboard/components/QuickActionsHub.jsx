import React from 'react';
import { Link } from 'react-router-dom';

function QuickActionsHub({ unreadCount = 0, pendingCount = 0 }) {
  const actions = [
    {
      to: '/add-project',
      label: 'Post Project',
      desc: 'Showcase your work or find teammates',
      icon: 'fa-plus-circle',
      bg: 'var(--rust)',
      color: '#fff',
      isPrimary: true
    },
    {
      to: '/students',
      label: 'Find Partners',
      desc: 'Discover peers by skill & department',
      icon: 'fa-user-group',
      bg: 'var(--ink)',
      color: '#fff'
    },
    {
      to: '/messages',
      label: 'Messages',
      desc: unreadCount > 0 ? `${unreadCount} unread message(s)` : 'Chat with connections',
      icon: 'fa-comment-dots',
      bg: unreadCount > 0 ? 'var(--sky, #2b6cb0)' : 'var(--paper)',
      color: unreadCount > 0 ? '#fff' : 'var(--ink)',
      badge: unreadCount > 0 ? `${unreadCount} new` : null,
      border: '1.5px solid var(--ink)'
    },
    {
      to: '/resources',
      label: 'Study Resources',
      desc: 'Notes, previous papers & guides',
      icon: 'fa-book-open',
      bg: 'var(--paper)',
      color: 'var(--ink)',
      border: '1.5px solid var(--ink)'
    }
  ];

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888' }}>
          <i className="fas fa-bolt me-1 text-rust"></i>Quick Actions Hub
        </div>
        <div style={{ fontSize: '.72rem', fontFamily: 'var(--font-mono)', color: '#aaa' }}>
          Direct Shortcuts
        </div>
      </div>

      <div className="row g-3">
        {actions.map((act, idx) => (
          <div key={idx} className="col-xl-3 col-md-6">
            <Link
              to={act.to}
              style={{
                display: 'block',
                textDecoration: 'none',
                background: act.bg,
                color: act.color,
                border: act.border || 'none',
                padding: '18px 20px',
                position: 'relative',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                boxShadow: act.isPrimary ? '4px 4px 0 var(--ink)' : '2px 2px 0 rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0 var(--ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = act.isPrimary ? '4px 4px 0 var(--ink)' : '2px 2px 0 rgba(0,0,0,0.1)';
              }}
            >
              {act.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--rust)',
                    color: '#fff',
                    fontSize: '.6rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {act.badge}
                </span>
              )}

              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '0',
                    background: act.isPrimary ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}
                >
                  <i className={`fas ${act.icon}`}></i>
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '.92rem', lineHeight: '1.2', color: act.color }}>
                    {act.label}
                  </div>
                  <div style={{ fontSize: '.72rem', opacity: 0.8, marginTop: '2px' }}>
                    {act.desc}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(QuickActionsHub);
