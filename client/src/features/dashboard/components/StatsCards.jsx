import React, { useMemo } from 'react';

export default function StatsCards({ stats = {} }) {
  const statCards = useMemo(() => [
    { value: stats.connCount || 0, label: 'Connections', icon: 'fa-user-check', bg: 'var(--moss)' },
    { value: stats.grpCount || 0, label: 'Groups', icon: 'fa-layer-group', bg: 'var(--sky)' },
    { value: stats.myProjectCount || 0, label: 'My Projects', icon: 'fa-code', bg: 'var(--rust)' },
    { value: stats.myLikesTotal || 0, label: 'Project Likes', icon: 'fa-heart', bg: 'var(--rust)' },
    { value: stats.myEndorseCount || 0, label: 'Endorsements', icon: 'fa-award', bg: 'var(--gold)' },
    { value: stats.pendingCount || 0, label: 'Pending Requests', icon: 'fa-user-clock', bg: '#888' },
    { value: stats.unreadCount || 0, label: 'Unread Messages', icon: 'fa-envelope', bg: 'var(--sky)' }
  ], [stats]);

  return (
    <div className="row g-3 mb-4">
      {statCards.map((s, idx) => (
        <div key={idx} className="col-xl-3 col-sm-6">
          <div className="cc-dash-stat-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="cc-dash-stat-num">{s.value}</div>
                <div className="cc-dash-stat-label mt-1">{s.label}</div>
              </div>
              <div style={{ width: '38px', height: '38px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${s.icon}`} style={{ color: '#fff', fontSize: '14px' }} aria-hidden="true"></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
