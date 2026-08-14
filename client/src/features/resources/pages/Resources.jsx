import React from 'react';
import { Link } from 'react-router-dom';
import { useResources } from '../hooks/useResources';

export default function Resources() {
  const {
    resources,
    loading,
    search,
    setSearch,
    department,
    setDepartment,
    semester,
    setSemester,
    type,
    setType,
    handleSearchSubmit,
    handleReset,
    handleLike,
    loggedInUser,
    token
  } = useResources();

  const departments = [
    'Computer Science Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Electronics',
    'Chemical Engineering',
    'Data Science',
    'Business Administration',
    'UX & Design',
    'MCA (Postgraduate)'
  ];

  const typeIcons = { notes: 'fa-file-lines', video: 'fa-video', book: 'fa-book', article: 'fa-newspaper', tool: 'fa-screwdriver-wrench', other: 'fa-link' };
  const typeColors = { notes: 'var(--sky)', video: 'var(--rust)', book: 'var(--moss)', article: 'var(--gold)', tool: '#7c3aed', other: '#888' };

  return (
    <div>

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className={token ? "" : "container py-4"}>
              <div style={{ background: 'var(--ink)', padding: '24px 40px', color: '#fff', marginBottom: '30px' }}>
                <div className="cc-section-label white-lbl">Repository</div>
                <h1 className="cc-heading on-dark">STUDY <em>Resources</em></h1>
                <p style={{ color: 'rgba(255,255,255,.4)', margin: '10px 0 0', fontSize: '.9rem' }}>
                  Access peer-shared lecture notes, textbook PDFs, system tools, and reference tutorials.
                </p>
              </div>

              {/* Filters */}
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="cc-form-label">Search Title / Desc</label>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="cc-form-input"
                        placeholder="e.g. Calculus, OS, Database"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="cc-form-label">Department / Course</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="cc-form-input"
                      >
                        <option value="">— All Departments —</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="cc-form-label">Resource Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="cc-form-input"
                      >
                        <option value="">— All Types —</option>
                        <option value="notes">Lecture Notes</option>
                        <option value="book">Textbook PDF</option>
                        <option value="video">Video Tutorial</option>
                        <option value="tool">Software Tool / Code</option>
                        <option value="article">Article / Guide</option>
                        <option value="other">Other Reference</option>
                      </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-end gap-2">
                      <button type="submit" className="cc-btn-fill py-2 flex-grow-1" style={{ border: 'none', height: '42px', fontSize: '.78rem' }}>
                        Filter
                      </button>
                      <button type="button" onClick={handleReset} className="cc-btn-outline py-2 px-3" style={{ height: '42px', fontSize: '.78rem' }}>
                        Reset
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="d-flex justify-content-end mb-4">
                <Link to={token ? "/post-resource" : "/login"} state={token ? null : { message: 'Please log in to share study materials or academic resources.' }} className="cc-btn-lg-dark" style={{ padding: '10px 20px', fontSize: '.76rem' }}>
                  <span>{token ? 'Share Resource' : 'Login to Share Resource'}</span><i className="fas fa-plus ms-2"></i>
                </Link>
              </div>

              {/* Resources list */}
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                  Filtering study repository…
                </div>
              ) : resources.length > 0 ? (
                <div className="row g-4">
                  {resources.map((r) => {
                    const ic = typeIcons[r.type] || 'fa-link';
                    const clr = typeColors[r.type] || 'var(--ink)';

                    return (
                      <div key={r._id} className="col-md-6 col-xl-4">
                        <div className="cc-feature-card d-flex flex-column justify-content-between" style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', boxShadow: '4px 4px 0px var(--ink)', minHeight: '260px' }}>
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span style={{ fontSize: '.58rem', fontFamily: 'var(--font-mono)', border: `1px solid ${clr}`, color: clr, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                                <i className={`fas ${ic} me-1`}></i>{r.type}
                              </span>
                              <span style={{ fontSize: '.68rem', fontFamily: 'var(--font-mono)', color: 'var(--rust)' }}>
                                {r.department}
                              </span>
                            </div>

                            <h4 style={{ fontWeight: '700', fontSize: '1.15rem', margin: '0 0 8px' }}>
                              {r.title}
                            </h4>
                            <p style={{ fontSize: '.84rem', color: '#555', lineHeight: '1.5' }}>
                              {r.description}
                            </p>
                          </div>

                          <div style={{ borderTop: '1px solid var(--cream)', paddingTop: '12px', marginTop: '12px' }} className="d-flex align-items-center justify-content-between">
                            <span style={{ fontSize: '.74rem', color: '#777' }}>
                              Shared by: <strong style={{ color: 'var(--ink)' }}>{r.userId?.name ? r.userId.name.split(' ')[0] : 'Peer'}</strong>
                            </span>
                            {r.url ? (
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="cc-btn-outline px-3 py-1 text-center"
                                style={{ fontSize: '.74rem', fontWeight: '600' }}
                              >
                                <i className="fas fa-arrow-up-right-from-square me-1"></i>Open Link
                              </a>
                            ) : (
                              <span style={{ fontSize: '.74rem', fontStyle: 'italic', color: '#999' }}>No Link URL</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5" style={{ color: '#aaa', border: '1.5px dashed var(--cream)', background: '#fff' }}>
                  <i className="fas fa-book-open fa-2x mb-3"></i>
                  <p>No study resources found matching filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
