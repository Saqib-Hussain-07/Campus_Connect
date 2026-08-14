import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getAvatarUrl } from '../../../utils/avatar';

export default function Notices() {
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user'));

  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotices = () => {
    setLoading(true);
    fetch('/api/notices')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotices(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePinToggle = async (noticeId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notices/${noticeId}/pin`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotices();
      }
    } catch (err) {}
  };

  const handleSearchClear = () => {
    setSearch('');
  };

  const catLabels = {
    all: 'All',
    opportunity: 'Opportunity',
    academic: 'Academic',
    internship: 'Internship',
    placement: 'Placement',
    general: 'General',
    urgent: 'Urgent'
  };

  const catColors = {
    opportunity: 'var(--moss)',
    academic: 'var(--sky)',
    internship: 'var(--rust)',
    placement: 'var(--gold)',
    general: '#888',
    urgent: '#dc3545'
  };

  const catIcons = {
    opportunity: 'fa-star',
    academic: 'fa-book',
    internship: 'fa-briefcase',
    placement: 'fa-building',
    general: 'fa-bullhorn',
    urgent: 'fa-triangle-exclamation'
  };

  const filteredNotices = notices.filter((n) => {
    const matchCat = category === 'all' || n.category === category;
    const matchSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase()) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    return matchCat && matchSearch;
  });

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className={token ? "" : "container py-4"}>
              
              {/* Header */}
              <div style={{ background: 'var(--ink)', padding: '24px 40px', color: '#fff', marginBottom: '30px' }}>
                <div className="cc-section-label white-lbl">Announcements</div>
                <h1 className="cc-heading on-dark">NOTICE <em>Board</em></h1>
                <p style={{ color: 'rgba(255,255,255,.4)', margin: '10px 0 0', fontSize: '.9rem' }}>
                  View important academic updates, internship deadlines, placement vacancies, and campus announcements.
                </p>
              </div>

              {/* Filters & Search */}
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-8">
                    <label className="cc-form-label">Search Notices</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="cc-form-input"
                        placeholder="Keywords, tags, titles..."
                      />
                      {search && (
                        <button
                          onClick={handleSearchClear}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: '.85rem'
                          }}
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <Link to={token ? "/post-notice" : "/login"} state={token ? null : { message: 'Please log in to post campus announcements or notices.' }} className="cc-btn-lg-dark w-100 justify-content-center" style={{ height: '42px', padding: '0 20px', fontSize: '.76rem' }}>
                      <span>{token ? 'Post a Notice' : 'Login to Post Notice'}</span><i className="fas fa-plus ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Category chips */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {Object.keys(catLabels).map((key) => {
                  const isActive = category === key;
                  const borderClr = isActive ? (key === 'all' ? 'var(--ink)' : catColors[key]) : 'var(--cream)';
                  const bg = isActive ? (key === 'all' ? 'var(--ink)' : catColors[key]) : 'transparent';
                  const textClr = isActive ? '#fff' : '#888';

                  return (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      style={{
                        padding: '6px 16px',
                        border: `1.5px solid ${borderClr}`,
                        background: bg,
                        color: textClr,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.06em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all .2s'
                      }}
                    >
                      {key !== 'all' && <i className={`fas ${catIcons[key]}`}></i>}
                      {catLabels[key]}
                    </button>
                  );
                })}
              </div>

              {/* Notices List */}
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                  Filtering notice board…
                </div>
              ) : filteredNotices.length > 0 ? (
                <div className="d-flex flex-column gap-3 mb-4">
                  {filteredNotices.map((n, idx) => {
                    const clr = catColors[n.category] || 'var(--ink)';
                    const icon = catIcons[n.category] || 'fa-bullhorn';
                    const isAuthor = loggedInUser && n.userId?._id === loggedInUser.id;

                    return (
                      <div
                        key={n._id}
                        style={{
                          border: n.isPinned ? '1.5px solid var(--rust)' : '1.5px solid var(--ink)',
                          background: 'var(--white)',
                          boxShadow: n.isPinned ? '4px 4px 0 var(--rust)' : '4px 4px 0 var(--ink)',
                          overflow: 'hidden',
                          display: 'flex'
                        }}
                      >
                        {/* Category stripe */}
                        <div style={{ width: '6px', background: clr, flexShrink: 0 }}></div>

                        <div style={{ padding: '22px 24px', flex: 1 }}>
                          <div className="d-flex align-items-start gap-3 flex-wrap">
                            
                            {/* Icon */}
                            <div style={{ width: '40px', height: '40px', background: clr, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <i className={`fas ${icon}`} style={{ color: '#fff', fontSize: '14px' }}></i>
                            </div>

                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                {n.isPinned && (
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.58rem', background: 'var(--rust)', color: '#fff', padding: '1px 7px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                                    📌 Pinned
                                  </span>
                                )}
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', border: `1px solid ${clr}`, color: clr, padding: '1px 8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                                  {catLabels[n.category]}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: '#888' }}>
                                  {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {token && isAuthor && (
                                  <button
                                    onClick={() => handlePinToggle(n._id)}
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: n.isPinned ? 'var(--rust)' : '#aaa', fontSize: '.75rem', marginLeft: 'auto' }}
                                    title="Toggle Pin"
                                  >
                                    <i className="fas fa-thumbtack"></i>
                                  </button>
                                )}
                              </div>

                              <h3 style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '8px', lineHeight: 1.3 }}>
                                {n.title}
                              </h3>
                              <p style={{ fontSize: '.86rem', lineHeight: 1.65, color: '#555', marginBottom: '12px', whiteSpace: 'pre-line' }}>
                                {n.body}
                              </p>

                              {/* Tags */}
                              {n.tags && n.tags.length > 0 && (
                                <div className="d-flex flex-wrap gap-1 mb-2">
                                  {n.tags.map((tag, tIdx) => (
                                    <span key={tIdx} style={{ padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: '.6rem', border: '1px solid var(--cream)', color: '#aaa', textTransform: 'lowercase' }}>
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Author & Expiry */}
                              <div className="d-flex align-items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid #fcfbf9' }}>
                                <img
                                  src={getAvatarUrl(n.userId)}
                                  style={{ width: '24px', height: '24px', objectFit: 'cover', border: '1px solid var(--ink)' }}
                                  alt=""
                                />
                                <span style={{ fontSize: '.74rem', color: '#888' }}>
                                  Posted by <strong>{n.userId?.name || 'Academic Office'}</strong> {n.userId?.department && `· ${n.userId.department}`}
                                </span>
                                {n.expiresAt && (
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--rust)', marginLeft: 'auto' }}>
                                    <i className="fas fa-clock me-1"></i>Expires {new Date(n.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5" style={{ color: '#aaa', border: '1.5px dashed var(--cream)', background: '#fff' }}>
                  <i className="fas fa-bullhorn fa-2x mb-3"></i>
                  <p>No announcements found matching filters.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
