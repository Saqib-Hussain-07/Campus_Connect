import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

export default function Groups() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user'));

  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGroups = () => {
    setLoading(true);
    const query = new URLSearchParams({
      search,
      type
    }).toString();

    fetch(`/api/content/groups?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchGroups();
  }, [type]); // Fetch automatically when type changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGroups();
  };

  const handleReset = () => {
    setSearch('');
    setType('');
    setTimeout(() => {
      fetch('/api/content/groups')
        .then((res) => res.json())
        .then((data) => setGroups(data));
    }, 50);
  };

  const handleJoinGroup = async (groupId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`/api/content/groups/${groupId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGroups();
      }
    } catch (err) {}
  };

  const typeIcons = { study: 'fa-book-open', project: 'fa-code-branch', forum: 'fa-comments' };
  const typeColors = { study: 'var(--sky)', project: 'var(--rust)', forum: 'var(--gold)' };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12" style={{ minHeight: '100vh' }}>
            {/* Header Box (Flush with Navbar) */}
            <div style={{ background: 'var(--ink)', padding: '48px 40px', color: '#fff', marginBottom: '30px', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>
                —— Communities
              </div>
              <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                <div>
                  <h1 className="cc-heading on-dark" style={{ fontSize: '4.5rem', fontWeight: 'normal', lineHeight: '0.95', margin: '0 0 16px 0' }}>
                    COLLABORATION & <em>Groups</em>
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,.4)', margin: '0', fontSize: '.9rem', lineHeight: '1.4' }}>
                    Join study circles, form project teams, or engage in open discussions.
                  </p>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  {token ? (
                    <Link to="/create-group" style={{ color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.08em', fontWeight: 'bold' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rust)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                    >
                      CREATE GROUP <i className="fas fa-arrow-right ms-1"></i>
                    </Link>
                  ) : (
                    <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.08em', fontWeight: 'bold' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rust)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                    >
                      LOGIN TO CREATE <i className="fas fa-arrow-right ms-1"></i>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Inner Content */}
            <div className={token ? "px-4 pb-5" : "container pb-5"}>
              {/* Filter Form */}
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="row g-3">
                    <div className="col-md-9">
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                        Search Groups
                      </label>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Name or keyword..."
                        style={{
                          background: '#fafaf8',
                          border: '1px solid #d3c9b9',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          color: 'var(--ink)',
                          width: '100%',
                          outline: 'none',
                          borderRadius: '0',
                          height: '48px'
                        }}
                      />
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <button 
                        type="submit" 
                        style={{
                          background: 'var(--rust)',
                          color: 'var(--white)',
                          border: 'none',
                          padding: '12px 24px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          width: '100%',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rust-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--rust)'}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Tabs Section */}
              <div className="d-flex gap-4 mb-4" style={{ borderBottom: '1.5px solid #d3c9b9', paddingBottom: '0' }}>
                {[
                  { label: 'All Groups', value: '' },
                  { label: 'Study', value: 'study' },
                  { label: 'Projects', value: 'project' },
                  { label: 'Forums', value: 'forum' }
                ].map((tab) => {
                  const isActive = type === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setType(tab.value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: isActive ? '3px solid var(--rust)' : '3px solid transparent',
                        padding: '10px 4px 12px 4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        color: isActive ? 'var(--rust)' : '#777',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Groups Grid */}
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                  Filtering Study Groups…
                </div>
              ) : groups.length > 0 ? (
                <div className="row g-4">
                  {groups.map((group) => {
                    const isMember = loggedInUser && group.members?.includes(loggedInUser.id);
                    
                    let statusText = '🔵 OPEN';
                    let statusBorderColor = '#d3c9b9';
                    let statusColor = 'var(--ink)';
                    
                    if (group.type === 'study') {
                      statusText = '🟢 ACTIVE';
                      statusBorderColor = 'var(--moss)';
                      statusColor = 'var(--moss)';
                    } else if (group.type === 'project') {
                      statusText = '🔴 RECRUITING';
                      statusBorderColor = 'var(--rust)';
                      statusColor = 'var(--rust)';
                    } else if (group.type === 'forum') {
                      statusText = '🔵 OPEN';
                      statusBorderColor = 'var(--sky)';
                      statusColor = 'var(--sky)';
                    }

                    return (
                      <div key={group._id} className="col-md-6 col-xl-4">
                        <div 
                          style={{ 
                            border: '1.5px solid var(--ink)', 
                            background: 'var(--white)', 
                            minHeight: '260px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}
                        >
                          <div>
                            {/* Card Header (Image background with centered text) */}
                            <div style={{
                              height: '130px',
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.65)), url(https://picsum.photos/seed/${encodeURIComponent(group.name)}/400/200)`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '16px',
                              borderBottom: '1.5px solid var(--ink)',
                              textAlign: 'center'
                            }}>
                              <h3 style={{ 
                                color: '#fff', 
                                fontWeight: 'bold', 
                                fontSize: '1.3rem', 
                                margin: '0', 
                                textShadow: '1px 1px 3px rgba(0,0,0,0.8)' 
                              }}>
                                {group.name}
                              </h3>
                            </div>

                            {/* Card Details */}
                            <div style={{ padding: '20px 20px 0 20px' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                                <span style={{ border: `1px solid ${statusBorderColor}`, color: statusColor, padding: '2px 8px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                  {statusText}
                                </span>
                                <span style={{ color: '#666' }}>
                                  <i className="fas fa-users me-1"></i> {group.members ? group.members.length : 0} members
                                </span>
                              </div>

                              <p style={{ 
                                fontSize: '0.82rem', 
                                color: '#444', 
                                lineHeight: '1.5', 
                                margin: '0 0 16px', 
                                display: '-webkit-box', 
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden' 
                              }}>
                                {group.description}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer (Member avatars overlap & Join Button) */}
                          <div style={{
                            borderTop: '1px solid #e3dbcd',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#fafaf8'
                          }}>
                            {/* Member Avatars */}
                            <div className="d-flex align-items-center">
                              {Array.from({ length: Math.min(3, group.members?.length || 1) }).map((_, idx) => (
                                <img
                                  key={idx}
                                  src={`https://picsum.photos/seed/member-${idx}-${encodeURIComponent(group.name)}/40/40`}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border: '1px solid var(--ink)',
                                    marginLeft: idx > 0 ? '-8px' : '0',
                                    objectFit: 'cover'
                                  }}
                                  alt="Member"
                                />
                              ))}
                              {(group.members?.length || 0) > 3 && (
                                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#888', marginLeft: '6px' }}>
                                  +{group.members.length - 3}
                                </span>
                              )}
                            </div>

                            {/* Join Button */}
                            <button
                              onClick={() => handleJoinGroup(group._id)}
                              style={{
                                background: isMember ? 'var(--moss)' : 'var(--ink)',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 14px',
                                fontSize: '0.68rem',
                                fontFamily: 'var(--font-mono)',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                borderRadius: 0,
                                cursor: 'pointer',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (!isMember) e.currentTarget.style.background = 'var(--rust)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isMember) e.currentTarget.style.background = 'var(--ink)';
                              }}
                            >
                              {isMember ? 'Joined' : 'Join'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5" style={{ color: '#aaa', border: '1.5px dashed var(--cream)', background: '#fff' }}>
                  <i className="fas fa-users-slash fa-2x mb-3"></i>
                  <p>No study groups found matching filters.</p>
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
