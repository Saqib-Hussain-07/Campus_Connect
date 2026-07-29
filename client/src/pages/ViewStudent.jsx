import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';
import Loader from '../components/Loader';

export default function ViewStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user'));

  const [studentData, setStudentData] = useState(null);
  const [connection, setConnection] = useState(null); // { status, connectionId, fromUser }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentDetails = async () => {
    try {
      // 1. Fetch details
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error('Student not found');
      const data = await res.json();
      setStudentData(data);

      // 2. Fetch connection status if logged in
      if (token && loggedInUser && loggedInUser.id !== id) {
        const connRes = await fetch(`/api/users/connections/status/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const connData = await connRes.json();
        setConnection(connData);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [id, token]);

  const handleConnect = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`/api/users/${id}/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStudentDetails();
      }
    } catch (err) {}
  };

  const handleEndorse = async (skill) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/users/${id}/endorse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ skill })
      });
      if (res.ok) {
        fetchStudentDetails();
      }
    } catch (err) {}
  };

  const handleAcceptRequest = async (connId) => {
    try {
      const res = await fetch(`/api/users/connections/${connId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'accept' })
      });
      if (res.ok) {
        fetchStudentDetails();
      }
    } catch (err) {}
  };

  if (loading) return <Loader message="Loading Student Profile..." />;
  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-4 text-center" style={{ background: '#f5f3eb' }}>
        <div style={{ maxWidth: '500px', border: '2px solid var(--ink, #111)', background: 'var(--paper, #fcfbf7)', padding: '40px', boxShadow: '6px 6px 0 var(--ink, #111)' }}>
          <div style={{ fontSize: '3rem', color: 'var(--rust, #e15b34)', marginBottom: '20px' }}>
            <i className="fas fa-circle-exclamation"></i>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display, inherit)', fontSize: '1.8rem', color: 'var(--ink, #111)', marginBottom: '12px' }}>
            Profile Load Error
          </h2>
          <p style={{ fontSize: '.9rem', color: '#555', marginBottom: '24px', lineHeight: '1.6' }}>
            We could not find the student profile you were looking for, or there was a problem communicating with the server.
          </p>
          <div style={{ fontSize: '.72rem', fontFamily: 'var(--font-mono, monospace)', color: '#777', background: '#f4ece1', padding: '12px', marginBottom: '24px', border: '1px solid #ddd', textAlign: 'left', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            <strong>Detail:</strong> {error}
          </div>
          <button onClick={() => navigate('/students')} className="cc-btn-lg-dark" style={{ border: 'none', cursor: 'pointer', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>Back to Students</span><i className="fas fa-arrow-left"></i>
          </button>
        </div>
      </div>
    );
  }
  if (!studentData) return null;

  const { profile, groups, projects, endorsements } = studentData;

  // Check if I endorsed this skill
  const checkMyEndorsed = (skill) => {
    if (!loggedInUser) return false;
    return profile.endorsements?.some(
      (e) => e.skill.toLowerCase() === skill.toLowerCase() && e.endorserId === loggedInUser.id
    );
  };

  const isSelf = loggedInUser && loggedInUser.id === id;

  const catColors = { web: 'var(--sky)', mobile: 'var(--moss)', ml: 'var(--rust)', hardware: 'var(--gold)', research: '#7c3aed', other: '#888' };
  const catIcons = { web: 'fa-globe', mobile: 'fa-mobile-screen', ml: 'fa-brain', hardware: 'fa-microchip', research: 'fa-flask', other: 'fa-code' };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className={token ? "" : "container py-4"}>
              
              {/* Hero Banner */}
              <div style={{ height: '180px', background: 'var(--ink)', position: 'relative', overflow: 'hidden', marginBottom: '20px' }}>
                <img
                  src={`https://picsum.photos/seed/banner${id}/1200/400`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.2) saturate(.4)' }}
                  alt=""
                />
                <div style={{ position: 'absolute', bottom: '-40px', right: '40px', fontFamily: 'var(--font-display)', fontSize: '10rem', color: 'rgba(255,255,255,.03)', lineHeight: 1, pointerEvents: 'none' }}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Header info */}
              <div className="d-flex align-items-end gap-4 flex-wrap pb-4 mb-4 justify-content-between" style={{ borderBottom: '1.5px solid var(--ink)' }}>
                <div className="d-flex align-items-end gap-3 flex-wrap">
                  <img
                    src={`https://picsum.photos/seed/${encodeURIComponent(profile.name)}/200/200`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', border: '4px solid var(--paper)', background: 'var(--ink)', marginTop: '-50px', zIndex: 5, flexShrink: 0 }}
                    alt={profile.name}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#999', marginBottom: '4px' }}>
                      Student Portfolio
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: 0, color: 'var(--ink)', lineHeight: '.95' }}>
                      {profile.name}
                    </h1>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: '#888', marginTop: '6px' }}>
                      {profile.department} {profile.semester && `· Sem ${profile.semester}`} {profile.university && `· ${profile.university}`}
                    </div>
                    <div className="d-flex gap-3 mt-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: '#aaa' }}>
                      <span><i className="fas fa-code me-1" style={{ color: 'var(--rust)' }}></i>{projects.length} projects</span>
                      <span><i className="fas fa-layer-group me-1" style={{ color: 'var(--rust)' }}></i>{groups.length} circles</span>
                      <span>
                        <i className="fas fa-circle me-1" style={{ color: profile.isOnline ? '#22c55e' : '#94a3b8', fontSize: '6px' }}></i>
                        {profile.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex gap-2 mb-2">
                  {!token ? (
                    <Link to="/login" className="cc-btn-lg-dark" style={{ padding: '10px 22px', fontSize: '.8rem', textDecoration: 'none' }}>
                      <span>Connect</span><i className="fas fa-paper-plane ms-2"></i>
                    </Link>
                  ) : isSelf ? (
                    <Link to="/profile" className="cc-btn-lg-dark" style={{ padding: '10px 22px', fontSize: '.8rem', textDecoration: 'none' }}>
                      <span>Edit Profile</span><i className="fas fa-user-pen ms-2"></i>
                    </Link>
                  ) : connection?.status === 'accepted' ? (
                    <>
                      <Link to={`/messages?chat=${id}`} className="cc-btn-lg-dark" style={{ padding: '10px 22px', fontSize: '.8rem', textDecoration: 'none' }}>
                        <span>Message</span><i className="fas fa-comment-dots ms-2"></i>
                      </Link>
                      <span style={{ padding: '10px 20px', border: '2px solid var(--moss)', color: 'var(--moss)', fontSize: '.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.04em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-check"></i>Connected
                      </span>
                    </>
                  ) : connection?.status === 'pending' ? (
                    connection.fromUser === loggedInUser.id ? (
                      <span style={{ padding: '10px 20px', border: '2px solid rgba(0,0,0,.15)', color: '#aaa', fontSize: '.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Request Pending…
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcceptRequest(connection.connectionId)}
                        className="cc-btn-fill"
                        style={{ padding: '10px 22px', fontSize: '.8rem', border: 'none' }}
                      >
                        Accept Connection
                      </button>
                    )
                  ) : (
                    <button onClick={handleConnect} className="cc-btn-lg-dark" style={{ padding: '10px 22px', fontSize: '.8rem', border: 'none' }}>
                      <span>Connect</span><i className="fas fa-paper-plane ms-2"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Body */}
              <div className="row g-4">
                
                {/* Left column */}
                <div className="col-lg-8">
                  
                  {/* Bio */}
                  {profile.bio && (
                    <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px', marginBottom: '20px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '12px' }}>About</div>
                      <p style={{ fontSize: '.95rem', lineHeight: '1.8', color: '#444', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px', marginBottom: '20px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>Skills &amp; Endorsements</div>
                        {token && !isSelf && connection?.status === 'accepted' && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: '#aaa' }}>Click a skill to endorse</div>
                        )}
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {profile.skills.map((sk) => {
                          const isEndorsedByMe = checkMyEndorsed(sk);
                          const endObj = endorsements?.find((e) => e.skill.toLowerCase() === sk.toLowerCase());
                          const count = endObj ? endObj.cnt : 0;
                          const canToggleEndorse = token && !isSelf && connection?.status === 'accepted';

                          return (
                            <div
                              key={sk}
                              onClick={() => canToggleEndorse && handleEndorse(sk)}
                              className="cc-pill d-flex align-items-center gap-2"
                              style={{
                                cursor: canToggleEndorse ? 'pointer' : 'default',
                                border: isEndorsedByMe ? '1.5px solid var(--rust)' : '1px solid var(--cream)',
                                background: isEndorsedByMe ? 'var(--cream)' : 'var(--white)',
                                padding: '6px 12px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '.76rem'
                              }}
                            >
                              <span>{sk}</span>
                              {count > 0 && (
                                <span
                                  style={{
                                    background: isEndorsedByMe ? 'var(--rust)' : 'var(--ink)',
                                    color: '#fff',
                                    fontSize: '.58rem',
                                    padding: '1px 5px',
                                    borderRadius: '50%'
                                  }}
                                >
                                  {count}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Projects Showcase */}
                  <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>Projects</div>
                    
                    {projects.length > 0 ? (
                      <div className="row g-3">
                        {projects.map((p) => {
                          const clr = catColors[p.category] || '#888';
                          const ic = catIcons[p.category] || 'fa-code';
                          return (
                            <div key={p._id} className="col-md-6">
                              <div style={{ border: '1px solid var(--cream)', padding: '16px', background: 'var(--white)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span style={{ fontSize: '.58rem', fontFamily: 'var(--font-mono)', border: `1px solid ${clr}`, color: clr, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                                      <i className={`fas ${ic} me-1`}></i>{p.category}
                                    </span>
                                    <span style={{ fontSize: '.65rem', fontFamily: 'var(--font-mono)', color: p.status === 'completed' ? 'var(--moss)' : 'var(--rust)' }}>
                                      ● {p.status?.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <h5 style={{ fontWeight: '700', fontSize: '.95rem', margin: '4px 0 8px' }}>
                                    <Link to={`/projects/${p._id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{p.title}</Link>
                                  </h5>
                                  <p style={{ fontSize: '.8rem', color: '#666', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {p.description}
                                  </p>
                                </div>
                                <div className="d-flex gap-3 text-muted pt-2" style={{ fontSize: '.68rem', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--cream)' }}>
                                  <span><i className="fas fa-heart me-1"></i>{p.likes ? p.likes.length : 0} likes</span>
                                  <span><i className="fas fa-eye me-1"></i>{p.views || 0} views</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: '.84rem', color: '#aaa' }}>No projects shared by this student.</div>
                    )}
                  </div>

                </div>

                {/* Right column */}
                <div className="col-lg-4">
                  
                  {/* Circles Membership */}
                  <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '14px' }}>Study Circles Joined</div>
                    {groups.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {groups.map((g) => (
                          <div key={g._id} className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 style={{ fontWeight: '700', fontSize: '.84rem', margin: 0 }}>{g.name}</h6>
                              <span style={{ fontSize: '.64rem', color: '#888', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                                {g.type}
                              </span>
                            </div>
                            <span style={{ fontSize: '.64rem', color: 'var(--moss)', border: '1px solid var(--moss)', padding: '1px 6px', textTransform: 'uppercase' }}>
                              {g.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '.8rem', color: '#aaa' }}>This student hasn't joined any circles yet.</div>
                    )}
                  </div>

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
