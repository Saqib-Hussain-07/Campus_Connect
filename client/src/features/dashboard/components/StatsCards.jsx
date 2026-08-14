import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

function StatsCards({ stats = {} }) {
  const statCards = useMemo(() => [
    {
      value: stats.connCount || 0,
      label: 'Connected Peers',
      icon: 'fa-user-group',
      accent: 'var(--moss, #2d4a3e)',
      link: '/students'
    },
    {
      value: stats.myProjectCount || 0,
      label: 'My Projects',
      sub: `${stats.myLikesTotal || 0} total likes`,
      icon: 'fa-code-branch',
      accent: 'var(--rust, #e15b34)',
      link: '/projects'
    },
    {
      value: stats.grpCount || 0,
      label: 'Study Circles',
      icon: 'fa-layer-group',
      accent: 'var(--sky, #2b6cb0)',
      link: '/groups'
    },
    {
      value: stats.unreadCount || 0,
      label: 'Unread Messages',
      sub: stats.pendingCount ? `${stats.pendingCount} pending requests` : 'Direct messaging',
      icon: 'fa-envelope-open-text',
      accent: stats.unreadCount > 0 ? 'var(--rust)' : '#718096',
      link: '/messages'
    }
  ], [stats]);

  return (
    <div className="row g-3 mb-4">
      {statCards.map((s, idx) => (
        <div key={idx} className="col-xl-3 col-sm-6">
          <Link
            to={s.link}
            style={{
              display: 'block',
              textDecoration: 'none',
              border: '2px solid var(--ink)',
              background: 'var(--white)',
              padding: '20px',
              boxShadow: '3px 3px 0 var(--ink)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '5px 5px 0 var(--ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)';
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.6rem',
                    lineHeight: '1',
                    color: 'var(--ink)',
                    fontWeight: 'bold'
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    color: '#555',
                    marginTop: '6px',
                    fontWeight: 'bold'
                  }}
                >
                  {s.label}
                </div>
                {s.sub && (
                  <div style={{ fontSize: '.68rem', color: '#888', marginTop: '2px' }}>
                    {s.sub}
                  </div>
                )}
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  background: s.accent,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                <i className={`fas ${s.icon}`}></i>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default React.memo(StatsCards);
