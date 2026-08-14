import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import Loader from '../../../components/Loader';
import { getAvatarUrl } from '../../../utils/avatar';

import DashboardHeader from '../components/DashboardHeader';
import StatsCards from '../components/StatsCards';
import RecentProjects from '../components/RecentProjects';
import RecentEvents from '../components/RecentEvents';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardIndex() {
  const {
    user,
    data,
    loading,
    error,
    handleConnectionResponse,
    handleConnect
  } = useDashboard();

  if (loading) return <Loader message="Loading CampusConnect Dashboard..." />;
  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-4 text-center" style={{ background: '#f5f3eb' }}>
        <div style={{ maxWidth: '500px', border: '2px solid var(--ink, #111)', background: 'var(--paper, #fcfbf7)', padding: '40px', boxShadow: '6px 6px 0 var(--ink, #111)' }}>
          <div style={{ fontSize: '3rem', color: 'var(--rust, #e15b34)', marginBottom: '20px' }}>
            <i className="fas fa-circle-exclamation"></i>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display, inherit)', fontSize: '1.8rem', color: 'var(--ink, #111)', marginBottom: '12px' }}>
            Dashboard Error
          </h2>
          <p style={{ fontSize: '.9rem', color: '#555', marginBottom: '24px', lineHeight: '1.6' }}>
            An error occurred while loading your personalized dashboard. Please ensure you are logged in correctly and try again.
          </p>
          <div style={{ fontSize: '.72rem', fontFamily: 'var(--font-mono, monospace)', color: '#777', background: '#f4ece1', padding: '12px', marginBottom: '24px', border: '1px solid #ddd', textAlign: 'left', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            <strong>Detail:</strong> {error}
          </div>
          <button onClick={() => window.location.reload()} className="cc-btn-lg-dark" style={{ border: 'none', cursor: 'pointer', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>Refresh Page</span><i className="fas fa-arrows-rotate"></i>
          </button>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { stats, requests, myProjects, feed, suggestions, stEvents, recentNotices } = data;

  const feedIcons = {
    project_added: { icon: 'fa-code', color: 'var(--rust)' },
    event_created: { icon: 'fa-calendar', color: 'var(--moss)' },
    notice_posted: { icon: 'fa-bullhorn', color: 'var(--gold)' },
    resource_shared: { icon: 'fa-book', color: 'var(--sky)' },
    connected: { icon: 'fa-user-check', color: 'var(--moss)' },
    joined_group: { icon: 'fa-layer-group', color: 'var(--rust)' },
    endorsed: { icon: 'fa-award', color: 'var(--gold)' }
  };

  const nCatClr = { opportunity: 'var(--moss)', academic: 'var(--sky)', internship: 'var(--rust)', placement: 'var(--gold)', general: '#888', urgent: '#dc3545' };

  return (
    <div className="row g-0">
      <Sidebar />

      {/* Main Dashboard Content Landmark */}
      <main id="main-content" tabIndex="-1" className="col-xl-10 col-lg-9 cc-dash-content" style={{ outline: 'none' }}>
        <DashboardHeader user={user} />
        <StatsCards stats={stats} />

        <div className="row g-4">
          {/* LEFT Column */}
          <div className="col-xl-8">
            {/* Pending Requests */}
            {requests && requests.length > 0 && (
              <div style={{ border: '1.5px solid var(--rust)', background: 'var(--white)', padding: '24px', marginBottom: '20px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rust)', marginBottom: '14px' }}>
                  <i className="fas fa-user-clock me-1"></i>Pending Requests ({requests.length})
                </div>
                {requests.map((req) => (
                  <div key={req._id} className="d-flex align-items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--cream)' }}>
                    <img
                      src={getAvatarUrl(req.fromUser)}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                      alt=""
                    />
                    <div className="flex-grow-1">
                      <div style={{ fontWeight: '700', fontSize: '.86rem', color: 'var(--ink)' }}>{req.fromUser.name}</div>
                      <div style={{ fontSize: '.66rem', color: '#888', fontFamily: 'var(--font-mono)' }}>{req.fromUser.department || 'Student'}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleConnectionResponse(req._id, 'accept')}
                        style={{ padding: '6px 14px', background: 'var(--moss)', border: 'none', color: '#fff', fontSize: '.7rem', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleConnectionResponse(req._id, 'reject')}
                        style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #ccc', color: '#888', fontSize: '.7rem', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My Projects Modular Component */}
            <RecentProjects myProjects={myProjects} />

            {/* Global Activity Feed */}
            <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '4px' }}>Real-time logs</div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', marginBottom: '24px' }}>Activity Feed</h4>

              {feed && feed.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {feed.map((act) => {
                    const iconSet = feedIcons[act.type] || { icon: 'fa-circle', color: '#888' };
                    return (
                      <div key={act._id} className="d-flex align-items-start gap-3">
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            background: iconSet.color,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            flexShrink: 0
                          }}
                        >
                          <i className={`fas ${iconSet.icon}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <span style={{ fontWeight: '700', fontSize: '.84rem', color: 'var(--ink)' }}>
                            {act.userId?.name || 'Someone'}
                          </span>{' '}
                          <span style={{ fontSize: '.84rem', color: '#555' }}>
                            {act.type === 'project_added' && 'added a new project'}
                            {act.type === 'event_created' && 'organized a campus event'}
                            {act.type === 'notice_posted' && 'posted a notice'}
                            {act.type === 'resource_shared' && 'shared a study resource'}
                            {act.type === 'connected' && 'connected with a new student'}
                            {act.type === 'joined_group' && 'joined a study circle'}
                            {act.type === 'endorsed' && 'endorsed a skill for'}
                          </span>{' '}
                          {act.refTitle && (
                            <strong style={{ fontSize: '.84rem', color: 'var(--rust)' }}>
                              {act.refTitle}
                            </strong>
                          )}
                          <div style={{ fontSize: '.62rem', color: '#999', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                            {new Date(act.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4" style={{ color: '#aaa' }}>No recent activity to show.</div>
              )}
            </div>
          </div>

          {/* RIGHT Column */}
          <div className="col-xl-4">
            {/* Suggestions */}
            <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '14px' }}>Suggested Network</div>
              {suggestions && suggestions.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {suggestions.map((s) => (
                    <div key={s._id} className="d-flex align-items-center gap-3">
                      <img
                        src={getAvatarUrl(s)}
                        style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1.5px solid var(--ink)', flexShrink: 0 }}
                        alt=""
                      />
                      <div className="flex-grow-1 min-width-0">
                        <h6 style={{ fontWeight: '700', fontSize: '.84rem', margin: 0, color: 'var(--ink)' }}>
                          <Link to={`/students/${s._id}`} style={{ color: 'var(--ink)' }}>{s.name}</Link>
                        </h6>
                        <div style={{ fontSize: '.64rem', color: '#888', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.department || 'Student'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnect(s._id)}
                        style={{ padding: '6px 12px', background: 'var(--ink)', border: 'none', color: '#fff', fontSize: '.68rem', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '.8rem', color: '#aaa' }}>No suggestions at this time.</div>
              )}
            </div>

            {/* Modular RecentEvents Component */}
            <RecentEvents stEvents={stEvents} />

            {/* Recent Notices */}
            <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '14px' }}>Notice Board</div>
              {recentNotices && recentNotices.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {recentNotices.map((n, idx) => {
                    const clr = nCatClr[n.category] || '#888';
                    return (
                      <div key={idx} className="pb-3" style={{ borderBottom: idx < recentNotices.length - 1 ? '1px solid var(--cream)' : 'none' }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span style={{ fontSize: '.5rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: clr, border: `1px solid ${clr}`, padding: '1px 6px' }}>
                            {n.category}
                          </span>
                          {n.isPinned && <i className="fas fa-thumbtack text-rust" style={{ fontSize: '10px' }}></i>}
                        </div>
                        <h6 style={{ fontWeight: '700', fontSize: '.82rem', margin: '0 0 2px', color: 'var(--ink)' }}>
                          <Link to="/notices" style={{ color: 'var(--ink)' }}>{n.title}</Link>
                        </h6>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '.8rem', color: '#aaa' }}>No notices posted recently.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
