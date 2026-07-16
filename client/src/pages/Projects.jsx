import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

export default function Projects() {
  const token = localStorage.getItem('campusconnect_token');
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    setLoading(true);
    const query = new URLSearchParams({
      search,
      category,
      status
    }).toString();

    fetch(`/api/content/projects?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [category, status]); // fetch on filter selection changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setTimeout(() => {
      fetch('/api/content/projects')
        .then((res) => res.json())
        .then((data) => setProjects(data));
    }, 50);
  };

  const catColors = { web: 'var(--sky)', mobile: 'var(--moss)', ml: 'var(--rust)', hardware: 'var(--gold)', research: '#7c3aed', other: '#888' };
  const catIcons = { web: 'fa-globe', mobile: 'fa-mobile-screen', ml: 'fa-brain', hardware: 'fa-microchip', research: 'fa-flask', other: 'fa-code' };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '92px', background: 'var(--paper)', minHeight: '100vh' }}>
          <div className="col-12" style={{ minHeight: '100vh' }}>
            {/* Header Box (Flush with Navbar) */}
            <div style={{ background: 'var(--ink)', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 40px)', color: '#fff', marginBottom: '30px', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>
                —— Student Work
              </div>
              <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                <div>
                  <h1 className="cc-heading on-dark" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 'normal', lineHeight: '0.95', margin: '0 0 16px 0' }}>
                    PROJECTS <em>Showcase</em>
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 4px', fontSize: '.9rem', lineHeight: '1.4' }}>
                    Discover what students are building — from AI tools to hardware robots.
                  </p>
                  <p style={{ color: 'rgba(255,255,255,.4)', margin: '0', fontSize: '.9rem', lineHeight: '1.4' }}>
                    Like, comment, and request to join a team.
                  </p>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  {token ? (
                    <Link to="/add-project" style={{ color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.08em', fontWeight: 'bold' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rust)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                    >
                      POST PROJECT <i className="fas fa-arrow-right ms-1"></i>
                    </Link>
                  ) : (
                    <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.08em', fontWeight: 'bold' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rust)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                    >
                      LOGIN TO POST <i className="fas fa-arrow-right ms-1"></i>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Inner Content */}
            <div className="cc-dash-content pb-5">
              {/* Filter Panel */}
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="row g-3">
                    <div className="col-lg-4 col-md-6">
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                        Search Projects
                      </label>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Title, tech stack, keyword..."
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
                    <div className="col-lg-3 col-md-6">
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          background: '#fafaf8',
                          border: '1px solid #d3c9b9',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          color: 'var(--ink)',
                          width: '100%',
                          outline: 'none',
                          borderRadius: '0',
                          height: '48px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">All</option>
                        <option value="web">Web Application</option>
                        <option value="mobile">Mobile Application</option>
                        <option value="ai_ml">AI / Machine Learning</option>
                        <option value="iot_hardware">IoT / Hardware</option>
                        <option value="research">Research / Other</option>
                      </select>
                    </div>
                    <div className="col-lg-2 col-md-6">
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{
                          background: '#fafaf8',
                          border: '1px solid #d3c9b9',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          color: 'var(--ink)',
                          width: '100%',
                          outline: 'none',
                          borderRadius: '0',
                          height: '48px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">All</option>
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                      </select>
                    </div>
                    <div className="col-lg-3 col-md-6 d-flex align-items-end">
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
                        Filter
                      </button>
                    </div>
                  </div>
                </form>

                {/* Category filter pills */}
                <div className="d-flex flex-wrap gap-2 mt-4">
                  {[
                    { label: '🌐 Web', value: 'web' },
                    { label: '📱 Mobile', value: 'mobile' },
                    { label: '🤖 AI / ML', value: 'ai_ml' },
                    { label: '⚙️ Hardware', value: 'iot_hardware' },
                    { label: '🔬 Research', value: 'research' }
                  ].map((pill) => {
                    const isActive = category === pill.value;
                    return (
                      <button
                        key={pill.value}
                        type="button"
                        onClick={() => setCategory(category === pill.value ? '' : pill.value)}
                        style={{
                          background: isActive ? 'var(--rust)' : '#fafaf8',
                          color: isActive ? '#fff' : 'var(--ink)',
                          border: '1px solid #d3c9b9',
                          padding: '6px 14px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {pill.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Show count */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.08em' }}>
                SHOWING {projects.length} OF {projects.length} PROJECTS
              </div>

              {/* Projects Grid */}
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                  Filtering Projects showcase…
                </div>
              ) : projects.length > 0 ? (
                <div className="row g-4">
                  {projects.map((proj) => {
                    const catNames = {
                      web: 'Web App',
                      mobile: 'Mobile App',
                      ai_ml: 'AI / ML',
                      iot_hardware: 'IoT / HW',
                      research: 'Research'
                    };
                    const catName = catNames[proj.category] || proj.category;

                    return (
                      <div key={proj._id} className="col-xl-4 col-md-6">
                        <div 
                          style={{ 
                            border: '1.5px solid var(--ink)', 
                            background: 'var(--white)', 
                            minHeight: '380px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}
                        >
                          <div>
                            {/* Card Top Image Block */}
                            <div style={{
                              height: '160px',
                              position: 'relative',
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.75)), url(https://picsum.photos/seed/${encodeURIComponent(proj.title)}/400/220)`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              padding: '16px',
                              borderBottom: '1.5px solid var(--ink)'
                            }}>
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <span style={{
                                  fontSize: '0.58rem',
                                  fontFamily: 'var(--font-mono)',
                                  textTransform: 'uppercase',
                                  padding: '4px 8px',
                                  background: 'var(--rust)',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                  letterSpacing: '0.04em'
                                }}>
                                  {catName}
                                </span>
                                <span style={{
                                  fontSize: '0.58rem',
                                  fontFamily: 'var(--font-mono)',
                                  textTransform: 'uppercase',
                                  padding: '4px 8px',
                                  background: 'var(--moss)',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                  letterSpacing: '0.04em'
                                }}>
                                  {proj.status === 'in_progress' ? 'IN PROGRESS' : 'COMPLETED'}
                                </span>
                              </div>

                              <h3 style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '1.25rem',
                                margin: '0',
                                textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
                              }}>
                                {proj.title}
                              </h3>
                            </div>

                            {/* Card Content details */}
                            <div style={{ padding: '20px 20px 0 20px' }}>
                              <div className="d-flex align-items-center gap-2 mb-3">
                                <img
                                  src={`https://picsum.photos/seed/${encodeURIComponent(proj.userId?.name || 'peer')}/80/80`}
                                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--ink)' }}
                                  alt={proj.userId?.name}
                                />
                                <div style={{ fontSize: '0.78rem', color: '#555' }}>
                                  <strong style={{ color: 'var(--ink)' }}>{proj.userId?.name || 'Peer'}</strong> · {proj.userId?.department || 'Engineering'}
                                </div>
                              </div>

                              <p style={{
                                fontSize: '0.82rem',
                                color: '#444',
                                lineHeight: '1.5',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                margin: '0 0 16px'
                              }}>
                                {proj.description}
                              </p>

                              <div className="d-flex flex-wrap gap-1 mb-3">
                                {(Array.isArray(proj.techStack) ? proj.techStack : (proj.techStack ? proj.techStack.split(',') : [])).map((t, idx) => (
                                  <span key={idx} style={{
                                    fontSize: '0.58rem',
                                    fontFamily: 'var(--font-mono)',
                                    padding: '2px 6px',
                                    background: '#fafaf8',
                                    border: '1px solid #d3c9b9',
                                    color: 'var(--ink)',
                                    textTransform: 'uppercase'
                                  }}>
                                    {t.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Card Bottom Stats & Actions */}
                          <div style={{
                            borderTop: '1px solid #e3dbcd',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#fafaf8'
                          }}>
                            <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.72rem', color: '#666', fontFamily: 'var(--font-mono)' }}>
                              <span>
                                <i className="far fa-heart text-danger me-1"></i> {proj.likes ? proj.likes.length : 0}
                              </span>
                              <span>
                                <i className="far fa-comment me-1"></i> {proj.comments ? proj.comments.length : 0}
                              </span>
                              <span>
                                <i className="far fa-eye me-1"></i> {proj.views || 0}
                              </span>
                            </div>

                            <div className="d-flex align-items-center gap-1">
                              {proj.githubLink && (
                                <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" style={{
                                  width: '32px',
                                  height: '32px',
                                  border: '1px solid var(--ink)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--ink)',
                                  background: '#fff',
                                  fontSize: '0.85rem'
                                }}>
                                  <i className="fab fa-github"></i>
                                </a>
                              )}
                              {proj.liveLink && (
                                <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" style={{
                                  width: '32px',
                                  height: '32px',
                                  border: '1px solid var(--ink)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--ink)',
                                  background: '#fff',
                                  fontSize: '0.85rem'
                                }}>
                                  <i className="fas fa-external-link-alt"></i>
                                </a>
                              )}
                              <Link to={`/projects/${proj._id}`} style={{
                                background: 'var(--ink)',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 14px',
                                fontSize: '0.68rem',
                                fontFamily: 'var(--font-mono)',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5" style={{ color: '#aaa', border: '1.5px dashed var(--cream)', background: '#fff' }}>
                  <i className="fas fa-folder-open fa-2x mb-3"></i>
                  <p>No projects found matching the filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      <Footer />
    </div>
  );
}
