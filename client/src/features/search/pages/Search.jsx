import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getAvatarUrl } from '../../../utils/avatar';
import { useSearch } from '../hooks/useSearch';

export default function Search() {
  const {
    query,
    results,
    loading,
    token
  } = useSearch();

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className={token ? "" : "container py-4"}>
              <div style={{ background: 'var(--ink)', padding: '24px 40px', color: '#fff', marginBottom: '30px' }}>
                <div className="cc-section-label white-lbl">Search Results</div>
                <h1 className="cc-heading on-dark">SEARCH FOR <em>"{query}"</em></h1>
                <p style={{ color: 'rgba(255,255,255,.4)', margin: '10px 0 0', fontSize: '.9rem' }}>
                  Displaying matching results across the CampusConnect platform.
                </p>
              </div>

              {loading ? (
                <div className="loading">Searching network logs…</div>
              ) : (
                <div className="d-flex flex-column gap-5">
                  {/* 1. Students */}
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', borderBottom: '1px solid var(--cream)', paddingBottom: '8px', marginBottom: '16px' }}>
                      Students ({results.students?.length || 0})
                    </h4>
                    {results.students && results.students.length > 0 ? (
                      <div className="row g-3">
                        {results.students.map((student) => (
                          <div key={student._id} className="col-md-6 col-lg-4">
                            <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '16px', boxShadow: '3px 3px 0 var(--ink)' }} className="d-flex align-items-center gap-3">
                              <img
                                src={getAvatarUrl(student)}
                                style={{ width: '42px', height: '42px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                                alt={student.name}
                              />
                              <div>
                                <h6 style={{ fontWeight: '700', margin: 0 }}>
                                  <Link to={`/students/${student._id}`} style={{ color: 'var(--ink)' }}>{student.name}</Link>
                                </h6>
                                <div style={{ fontSize: '.72rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                                  {student.department}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '.84rem', color: '#888', fontStyle: 'italic' }}>No students match your query.</p>
                    )}
                  </div>

                  {/* 2. Projects */}
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', borderBottom: '1px solid var(--cream)', paddingBottom: '8px', marginBottom: '16px' }}>
                      Projects ({results.projects?.length || 0})
                    </h4>
                    {results.projects && results.projects.length > 0 ? (
                      <div className="row g-3">
                        {results.projects.map((proj) => (
                          <div key={proj._id} className="col-md-6">
                            <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '20px', boxShadow: '3px 3px 0 var(--ink)' }}>
                              <h5 style={{ fontWeight: '700', fontSize: '1.1rem', margin: '0 0 6px' }}>
                                <Link to={`/projects/${proj._id}`} style={{ color: 'var(--ink)' }}>{proj.title}</Link>
                              </h5>
                              <p style={{ fontSize: '.82rem', color: '#555', lineHeight: '1.4', margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {proj.description}
                              </p>
                              <div style={{ fontSize: '.72rem', color: '#777' }}>
                                Tech: <strong style={{ color: 'var(--ink)' }}>{Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '.84rem', color: '#888', fontStyle: 'italic' }}>No projects match your query.</p>
                    )}
                  </div>

                  {/* 3. Groups */}
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', borderBottom: '1px solid var(--cream)', paddingBottom: '8px', marginBottom: '16px' }}>
                      Groups ({results.groups?.length || 0})
                    </h4>
                    {results.groups && results.groups.length > 0 ? (
                      <div className="row g-3">
                        {results.groups.map((group) => (
                          <div key={group._id} className="col-md-6 col-lg-4">
                            <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '16px', boxShadow: '3px 3px 0 var(--ink)' }}>
                              <h6 style={{ fontWeight: '700', margin: '0 0 4px' }}>
                                <Link to="/groups" style={{ color: 'var(--ink)' }}>{group.name}</Link>
                              </h6>
                              <div style={{ fontSize: '.72rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                                {group.type} Circle
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '.84rem', color: '#888', fontStyle: 'italic' }}>No study groups match your query.</p>
                    )}
                  </div>

                  {/* 4. Events */}
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', borderBottom: '1px solid var(--cream)', paddingBottom: '8px', marginBottom: '16px' }}>
                      Events &amp; Hackathons ({results.events?.length || 0})
                    </h4>
                    {results.events && results.events.length > 0 ? (
                      <div className="row g-3">
                        {results.events.map((ev) => (
                          <div key={ev._id} className="col-md-6 col-lg-4">
                            <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '16px', boxShadow: '3px 3px 0 var(--ink)' }}>
                              <h6 style={{ fontWeight: '700', margin: '0 0 4px' }}>
                                <Link to="/events" style={{ color: 'var(--ink)' }}>{ev.title}</Link>
                              </h6>
                              <div style={{ fontSize: '.7rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                                <i className="fas fa-calendar-alt me-1"></i>{new Date(ev.eventDate).toLocaleDateString()} · {ev.venue}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '.84rem', color: '#888', fontStyle: 'italic' }}>No events match your query.</p>
                    )}
                  </div>
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
