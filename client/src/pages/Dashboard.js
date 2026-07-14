import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboard = () => {
      fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load dashboard data');
          return res.json();
        })
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    };

    fetchDashboard();
  }, [token, navigate]);

  const handleConnectionResponse = async (connId, action) => {
    try {
      const res = await fetch(`/api/users/connections/${connId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        // Refresh dashboard data
        const refreshRes = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const refreshJson = await refreshRes.json();
        setData(refreshJson);
      }
    } catch (err) {}
  };

  const handleConnect = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Refresh dashboard data
        const refreshRes = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const refreshJson = await refreshRes.json();
        setData(refreshJson);
      }
    } catch (err) {}
  };

  if (loading) return <div className="loading">Loading CampusConnect Dashboard…</div>;
  if (error) return <div className="loading">Error: {error}</div>;
  if (!data) return null;

  const { stats, requests, myGroupsData, myProjects, feed, suggestions, stEvents, recentNotices } = data;

  const statCards = [
    { value: stats.connCount, label: 'Connections', icon: 'fa-user-check', bg: 'var(--moss)' },
    { value: stats.grpCount, label: 'Groups', icon: 'fa-layer-group', bg: 'var(--sky)' },
    { value: stats.myProjectCount, label: 'My Projects', icon: 'fa-code', bg: 'var(--rust)' },
    { value: stats.myLikesTotal, label: 'Project Likes', icon: 'fa-heart', bg: 'var(--rust)' },
    { value: stats.myEndorseCount, label: 'Endorsements', icon: 'fa-award', bg: 'var(--gold)' },
    { value: stats.pendingCount, label: 'Pending Requests', icon: 'fa-user-clock', bg: '#888' },
    { value: stats.unreadCount, label: 'Unread Messages', icon: 'fa-envelope', bg: 'var(--sky)' }
  ];

  const catColors = { web: 'var(--sky)', mobile: 'var(--moss)', ml: 'var(--rust)', hardware: 'var(--gold)', research: '#7c3aed', other: '#888' };
  const catIcons = { web: 'fa-globe', mobile: 'fa-mobile-screen', ml: 'fa-brain', hardware: 'fa-microchip', research: 'fa-flask', other: 'fa-code' };
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
    <div>
      <Navbar />

      <div style={{ marginTop: '92px', background: 'var(--paper)', minHeight: '100vh' }}>
        <div className="row g-0">
          <Sidebar />

          {/* Main Dashboard Content */}
          <div className="col-xl-10 col-lg-9 cc-dash-content">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-5">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#aaa' }}>Dashboard</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', color: 'var(--ink)', lineHeight: '.95', marginTop: '4px' }}>
                  Hello, <span style={{ color: 'var(--rust)' }}>{JSON.parse(localStorage.getItem('campusconnect_user'))?.name.split(' ')[0]}</span>.
                </h2>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/add-project" className="cc-btn-lg-dark" style={{ padding: '10px 20px', fontSize: '.78rem' }}>
                  <span>Post Project</span><i className="fas fa-plus"></i>
                </Link>
                <Link to="/students" className="cc-btn-lg-ghost" style={{ padding: '10px 20px', fontSize: '.78rem' }}>
                  Find Students <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* Stats list */}
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
                        <i className={`fas ${s.icon}`} style={{ color: '#fff', fontSize: '14px' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                          src={`https://picsum.photos/seed/${encodeURIComponent(req.fromUser.name)}/80/80`}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                          alt={req.fromUser.name}
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

                {/* My Projects */}
                <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px', marginBottom: '24px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>Builds Showcase</div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', margin: 0 }}>My Projects</h4>
                    </div>
                    <Link to="/add-project" style={{ fontSize: '.76rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '700' }}>
                      + Post Project
                    </Link>
                  </div>

                  {myProjects && myProjects.length > 0 ? (
                    <div className="row g-3">
                      {myProjects.map((p) => {
                        const clr = catColors[p.category] || '#888';
                        const ic = catIcons[p.category] || 'fa-code';
                        return (
                          <div key={p._id} className="col-md-6">
                            <div className="cc-dash-proj-card" style={{ border: '1px solid var(--cream)', padding: '16px', background: 'var(--white)' }}>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <span style={{ fontSize: '.58rem', fontFamily: 'var(--font-mono)', border: `1px solid ${clr}`, color: clr, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                                  <i className={`fas ${ic} me-1`}></i>{p.category}
                                </span>
                                <span style={{ fontSize: '.65rem', fontFamily: 'var(--font-mono)', color: p.status === 'completed' ? 'var(--moss)' : 'var(--rust)' }}>
                                  ● {p.status.replace('_', ' ')}
                                </span>
                              </div>
                              <h5 style={{ fontWeight: '700', fontSize: '.95rem', margin: '4px 0 8px' }}>
                                <Link to={`/projects/${p._id}`} style={{ color: 'var(--ink)' }}>{p.title}</Link>
                              </h5>
                              <div className="d-flex gap-3 text-muted" style={{ fontSize: '.68rem', fontFamily: 'var(--font-mono)' }}>
                                <span><i className="fas fa-heart me-1"></i>{p.likes ? p.likes.length : 0} likes</span>
                                <span><i className="fas fa-eye me-1"></i>{p.views || 0} views</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4" style={{ color: '#aaa', fontSize: '.84rem' }}>
                      You haven't posted any projects yet. <Link to="/add-project" style={{ color: 'var(--rust)' }}>Create your first listing.</Link>
                    </div>
                  )}
                </div>

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
                            src={`https://picsum.photos/seed/${encodeURIComponent(s.name)}/80/80`}
                            style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1.5px solid var(--ink)', flexShrink: 0 }}
                            alt={s.name}
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

                {/* Upcoming Events */}
                <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '14px' }}>My Events Calendar</div>
                  {stEvents && stEvents.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {stEvents.map((ev, idx) => (
                        <div key={idx} className="pb-3" style={{ borderBottom: idx < stEvents.length - 1 ? '1px solid var(--cream)' : 'none' }}>
                          <h6 style={{ fontWeight: '700', fontSize: '.82rem', margin: '0 0 4px', color: 'var(--ink)' }}>{ev.title}</h6>
                          <div style={{ fontSize: '.68rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                            <i className="fas fa-calendar-alt me-1"></i>{new Date(ev.eventDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '.8rem', color: '#aaa' }}>
                      No upcoming events RSVP'd. <Link to="/events" style={{ color: 'var(--rust)' }}>Explore events.</Link>
                    </div>
                  )}
                </div>

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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
