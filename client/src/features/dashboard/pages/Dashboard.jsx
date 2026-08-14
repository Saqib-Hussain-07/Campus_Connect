import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import Loader from '../../../components/Loader';
import { getAvatarUrl } from '../../../utils/avatar';

import DashboardHeader from '../components/DashboardHeader';
import StatsCards from '../components/StatsCards';
import QuickActionsHub from '../components/QuickActionsHub';
import RecentProjects from '../components/RecentProjects';
import RecentEvents from '../components/RecentEvents';
import PlacementNoticesWidget from '../components/PlacementNoticesWidget';
import QuickLinksWidget from '../components/QuickLinksWidget';
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

  return (
    <div className="row g-0">
      <Sidebar />

      {/* Main Dashboard Content Landmark */}
      <main id="main-content" tabIndex="-1" className="col-xl-10 col-lg-9 cc-dash-content" style={{ outline: 'none', padding: '32px' }}>
        {/* 1. Identity & Greeting */}
        <DashboardHeader user={user} />

        {/* 2. Key Metrics Overview */}
        <StatsCards stats={stats} />

        {/* 3. Primary Quick Actions Hub */}
        <QuickActionsHub unreadCount={stats?.unreadCount} pendingCount={stats?.pendingCount} />

        <div className="row g-4">
          {/* LEFT Column: Projects, Feed & Requests */}
          <div className="col-xl-7">
            {/* Attention Center: Pending Requests */}
            {requests && requests.length > 0 && (
              <div
                style={{
                  border: '2px solid var(--rust)',
                  background: 'var(--white)',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '3px 3px 0 var(--rust)'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rust)', marginBottom: '14px', fontWeight: 'bold' }}>
                  <i className="fas fa-bell me-1"></i>Action Required: Connection Requests ({requests.length})
                </div>
                {requests.map((req) => (
                  <div key={req._id} className="d-flex align-items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--cream)' }}>
                    <img
                      src={getAvatarUrl(req.fromUser)}
                      style={{ width: '42px', height: '42px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                      alt=""
                    />
                    <div className="flex-grow-1 min-width-0">
                      <div style={{ fontWeight: '700', fontSize: '.9rem', color: 'var(--ink)' }}>{req.fromUser?.name}</div>
                      <div style={{ fontSize: '.7rem', color: '#666', fontFamily: 'var(--font-mono)' }}>
                        {req.fromUser?.department || 'Student'} {req.fromUser?.university ? `• ${req.fromUser.university}` : ''}
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleConnectionResponse(req._id, 'accept')}
                        style={{ padding: '7px 16px', background: 'var(--moss)', border: 'none', color: '#fff', fontSize: '.72rem', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleConnectionResponse(req._id, 'reject')}
                        style={{ padding: '7px 12px', background: 'transparent', border: '1px solid #ccc', color: '#888', fontSize: '.72rem', cursor: 'pointer' }}
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My Active Projects Component */}
            <RecentProjects myProjects={myProjects} />

            {/* Real-time Global Activity Feed */}
            <div style={{ border: '2px solid var(--ink)', background: 'var(--white)', padding: '28px', boxShadow: '3px 3px 0 var(--ink)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888' }}>
                    Campus Pulse
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', margin: 0 }}>
                    Activity Stream
                  </h4>
                </div>
                <span style={{ fontSize: '.68rem', fontFamily: 'var(--font-mono)', color: 'var(--moss)', fontWeight: 'bold' }}>
                  <i className="fas fa-circle-dot me-1"></i>Live Updates
                </span>
              </div>

              {feed && feed.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {feed.map((act) => {
                    const iconSet = feedIcons[act.type] || { icon: 'fa-circle', color: '#888' };
                    return (
                      <div key={act._id} className="d-flex align-items-start gap-3 p-2" style={{ borderBottom: '1px solid #f0eae1' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            background: iconSet.color,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            flexShrink: 0
                          }}
                        >
                          <i className={`fas ${iconSet.icon}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <span style={{ fontWeight: '700', fontSize: '.86rem', color: 'var(--ink)' }}>
                            {act.userId?.name || 'A student'}
                          </span>{' '}
                          <span style={{ fontSize: '.84rem', color: '#555' }}>
                            {act.type === 'project_added' && 'published a new project'}
                            {act.type === 'event_created' && 'organized a campus event'}
                            {act.type === 'notice_posted' && 'posted an announcement'}
                            {act.type === 'resource_shared' && 'shared a study resource'}
                            {act.type === 'connected' && 'connected with a peer'}
                            {act.type === 'joined_group' && 'joined a study circle'}
                            {act.type === 'endorsed' && 'received a skill endorsement'}
                          </span>{' '}
                          {act.refTitle && (
                            <strong style={{ fontSize: '.84rem', color: 'var(--rust)' }}>
                              "{act.refTitle}"
                            </strong>
                          )}
                          <div style={{ fontSize: '.64rem', color: '#999', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
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

          {/* RIGHT Column: Widgets & Discovery */}
          <div className="col-xl-5">
            {/* 1. Upcoming Events & Hackathons */}
            <RecentEvents stEvents={stEvents} />

            {/* 2. Notices & Placement Announcements */}
            <PlacementNoticesWidget notices={recentNotices} />

            {/* 3. Suggested Peers Network */}
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
                    Grow Your Circle
                  </div>
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', margin: 0 }}>
                    Suggested Peers
                  </h5>
                </div>
                <Link to="/students" style={{ fontSize: '.72rem', fontFamily: 'var(--font-mono)', color: 'var(--rust)', textTransform: 'uppercase', fontWeight: 'bold', textDecoration: 'none' }}>
                  Explore All →
                </Link>
              </div>

              {suggestions && suggestions.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {suggestions.map((s) => (
                    <div key={s._id} className="d-flex align-items-center gap-3 p-2" style={{ border: '1px solid #e0d8c8', background: 'var(--paper)' }}>
                      <img
                        src={getAvatarUrl(s)}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1.5px solid var(--ink)', flexShrink: 0 }}
                        alt=""
                      />
                      <div className="flex-grow-1 min-width-0">
                        <h6 style={{ fontWeight: '700', fontSize: '.86rem', margin: 0, color: 'var(--ink)' }}>
                          <Link to={`/students/${s._id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{s.name}</Link>
                        </h6>
                        <div style={{ fontSize: '.66rem', color: '#777', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.department || 'Student'} {s.skills && s.skills.length > 0 ? `• ${s.skills.slice(0, 2).join(', ')}` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnect(s._id)}
                        style={{ padding: '6px 14px', background: 'var(--ink)', border: 'none', color: '#fff', fontSize: '.7rem', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '.8rem', color: '#aaa' }}>No suggestions available at this time.</div>
              )}
            </div>

            {/* 4. Campus Navigation Quick Links */}
            <QuickLinksWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
