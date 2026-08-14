import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { getAvatarUrl } from '../../../utils/avatar';
import { useProjectDetails } from '../hooks/useProjectDetails';

export default function ViewProject() {
  const { id } = useParams();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user') || 'null');

  const {
    project,
    loading,
    error,
    commentText,
    setCommentText,
    requestText,
    setRequestText,
    requestSuccess,
    handleLike,
    handleCommentSubmit,
    handleJoinRequestSubmit,
    handleModerateRequest
  } = useProjectDetails(id);

  if (loading) return <Loader message="Loading Project Details..." />;
  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-4 text-center" style={{ background: '#f5f3eb' }}>
        <div style={{ maxWidth: '500px', border: '2px solid var(--ink, #111)', background: 'var(--paper, #fcfbf7)', padding: '40px', boxShadow: '6px 6px 0 var(--ink, #111)' }}>
          <div style={{ fontSize: '3rem', color: 'var(--rust, #e15b34)', marginBottom: '20px' }}>
            <i className="fas fa-circle-exclamation"></i>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display, inherit)', fontSize: '1.8rem', color: 'var(--ink, #111)', marginBottom: '12px' }}>
            Project Load Error
          </h2>
          <p style={{ fontSize: '.9rem', color: '#555', marginBottom: '24px', lineHeight: '1.6' }}>
            We could not find the project details you were looking for, or there was a problem communicating with the server.
          </p>
          <div style={{ fontSize: '.72rem', fontFamily: 'var(--font-mono, monospace)', color: '#777', background: '#f4ece1', padding: '12px', marginBottom: '24px', border: '1px solid #ddd', textAlign: 'left', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            <strong>Detail:</strong> {error}
          </div>
          <button onClick={() => navigate('/projects')} className="cc-btn-lg-dark" style={{ border: 'none', cursor: 'pointer', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>Back to Projects</span><i className="fas fa-arrow-left"></i>
          </button>
        </div>
      </div>
    );
  }
  if (!project) return null;

  const isOwner = loggedInUser && project.userId?._id === loggedInUser.id;
  const isLikedByMe = loggedInUser && project.likes?.includes(loggedInUser.id);
  const alreadyRequested = loggedInUser && project.requests?.some((r) => r.userId?._id === loggedInUser.id);

  const tech = Array.isArray(project.techStack)
    ? project.techStack
    : (project.techStack ? project.techStack.split(',').map((t) => t.trim()).filter(Boolean) : []);
  const catColors = { web: 'var(--sky)', mobile: 'var(--moss)', ml: 'var(--rust)', hardware: 'var(--gold)', research: '#7c3aed', other: '#888' };
  const catIcons = { web: 'fa-globe', mobile: 'fa-mobile-screen', ml: 'fa-brain', hardware: 'fa-microchip', research: 'fa-flask', other: 'fa-code' };
  const clr = catColors[project.category] || '#888';
  const icon = catIcons[project.category] || 'fa-code';

  return (
    <div>

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className={token ? "" : "container py-4"}>
              
              {/* Hero Banner */}
              <div style={{ height: 'clamp(180px, 20vw, 260px)', background: 'var(--ink)', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
                <img
                  src={`https://picsum.photos/seed/proj${project._id}/1200/400`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.25) saturate(.4)' }}
                  alt=""
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: 'clamp(16px, 4vw, 32px)' }}>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 12px', background: clr, fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>
                      <i className={`fas ${icon}`}></i> {project.category}
                    </span>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: '#fff', lineHeight: 1, margin: 0 }}>
                      {project.title}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Grid Content */}
              <div className="row g-4">
                
                {/* Left side */}
                <div className="col-lg-8">
                  
                  {/* About project */}
                  <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '32px', marginBottom: '20px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '14px' }}>About This Project</div>
                    <p style={{ fontSize: '.96rem', lineHeight: 1.8, color: '#444', margin: 0, whiteSpace: 'pre-line' }}>{project.description}</p>
                  </div>

                  {/* Tech stack */}
                  {tech.length > 0 && (
                    <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px', marginBottom: '20px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '14px' }}>Tech Stack</div>
                      <div className="d-flex flex-wrap gap-2">
                        {tech.map((t, idx) => (
                          <span key={idx} style={{ padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: '.72rem', border: '1.5px solid var(--ink)', textTransform: 'uppercase', letterSpacing: '.04em', background: 'var(--paper)', color: 'var(--ink)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Join team Request Form */}
                  {project.status === 'looking_for_team' && !isOwner && (
                    <div style={{ border: '1.5px solid var(--rust)', background: 'rgba(201,79,44,.04)', padding: '28px', marginBottom: '20px' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--rust)', marginBottom: '8px' }}>
                        <i className="fas fa-users me-2"></i>This project is looking for team members!
                      </div>
                      {alreadyRequested ? (
                        <p style={{ fontSize: '.88rem', color: 'var(--moss)', fontWeight: '600' }}>
                          <i className="fas fa-check-circle me-2"></i>You have already requested to join.
                        </p>
                      ) : token ? (
                        <form onSubmit={handleJoinRequestSubmit}>
                          <div className="mb-3">
                            <label className="cc-form-label">Why do you want to join? (pitch yourself)</label>
                            <textarea
                              value={requestText}
                              onChange={(e) => setRequestText(e.target.value)}
                              rows="2"
                              className="cc-form-input"
                              placeholder="Tell the author what skills you bring..."
                              required
                            ></textarea>
                          </div>
                          {requestSuccess && <div className="alert alert-success p-2 mb-3" style={{ fontSize: '.8rem' }}>{requestSuccess}</div>}
                          <button type="submit" className="cc-btn-lg-dark" style={{ padding: '12px 28px', fontSize: '.84rem' }}>
                            <span>Request to Join Team</span><i className="fas fa-paper-plane ms-2"></i>
                          </button>
                        </form>
                      ) : (
                        <Link to="/login" style={{ fontSize: '.84rem', color: 'var(--rust)', fontWeight: 600 }}>Login to request joining the team</Link>
                      )}
                    </div>
                  )}

                  {/* Comments Feed */}
                  <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '32px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '20px' }}>
                      Discussion ({project.comments ? project.comments.length : 0})
                    </div>

                    {project.comments && project.comments.length > 0 ? (
                      <div className="d-flex flex-column gap-4 mb-4">
                        {project.comments.map((c) => (
                          <div key={c._id} className="d-flex gap-3">
                            <img src={getAvatarUrl(c.userId)} style={{ width: '38px', height: '38px', objectFit: 'cover', border: '1.5px solid var(--ink)', flexShrink: 0 }} alt="" />
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span style={{ fontWeight: '700', fontSize: '.86rem', color: 'var(--ink)' }}>{c.userId?.name}</span>
                                <span style={{ fontSize: '.65rem', color: '#aaa', fontFamily: 'var(--font-mono)' }}>{c.userId?.department}</span>
                                <span style={{ fontSize: '.62rem', color: '#ccc', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div style={{ background: 'var(--paper)', padding: '12px 14px', border: '1px solid var(--cream)', fontSize: '.86rem', lineHeight: 1.65, color: '#444' }}>
                                {c.body}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#aaa', fontSize: '.84rem', marginBottom: '20px' }}>No comments yet. Be the first to leave feedback!</p>
                    )}

                    {token ? (
                      <form onSubmit={handleCommentSubmit}>
                        <div className="d-flex gap-2">
                          <img src={getAvatarUrl(loggedInUser)} style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1.5px solid var(--ink)', flexShrink: 0 }} alt="" />
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows="2"
                            required
                            className="cc-form-input flex-grow-1"
                            style={{ resize: 'none' }}
                            placeholder="Leave feedback, ask a question..."
                          ></textarea>
                          <button type="submit" style={{ padding: '8px 18px', background: 'var(--ink)', border: '1.5px solid var(--ink)', color: 'var(--paper)', fontSize: '13px', cursor: 'pointer', flexShrink: 0, transition: 'all .2s' }}>
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <Link to="/login" style={{ fontSize: '.84rem', color: 'var(--rust)', fontWeight: 600 }}>Login to post feedback comments</Link>
                    )}
                  </div>

                </div>

                {/* Right side metadata */}
                <div className="col-lg-4">
                  
                  {/* Stats & Actions */}
                  <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px', marginBottom: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>Project Information</div>
                    
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: '1px solid var(--cream)' }}>
                      <span style={{ fontSize: '.82rem', color: '#666' }}>Owner</span>
                      <strong style={{ fontSize: '.84rem', color: 'var(--ink)' }}>
                        <Link to={`/students/${project.userId?._id}`} style={{ color: 'var(--ink)' }}>{project.userId?.name}</Link>
                      </strong>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: '1px solid var(--cream)' }}>
                      <span style={{ fontSize: '.82rem', color: '#666' }}>Status</span>
                      <span style={{ fontSize: '.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: project.status === 'completed' ? 'var(--moss)' : 'var(--rust)', fontWeight: 700 }}>
                        {project.status?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: '1px solid var(--cream)' }}>
                      <span style={{ fontSize: '.82rem', color: '#666' }}>Likes</span>
                      <strong style={{ fontSize: '.84rem', color: 'var(--ink)' }}>{project.likes ? project.likes.length : 0} likes</strong>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <span style={{ fontSize: '.82rem', color: '#666' }}>Views Count</span>
                      <strong style={{ fontSize: '.84rem', color: 'var(--ink)' }}>{project.views || 0} views</strong>
                    </div>

                    <button onClick={handleLike} className="cc-btn-fill w-100 justify-content-center mb-3" style={{ height: '42px', border: 'none' }}>
                      <i className={`fas fa-heart me-2 ${isLikedByMe ? 'text-danger' : ''}`}></i>
                      {isLikedByMe ? 'Unlike Project' : 'Like Project'}
                    </button>

                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noreferrer" className="cc-btn-outline w-100 justify-content-center text-center py-2 mb-2 d-flex align-items-center" style={{ fontSize: '.84rem' }}>
                        <i className="fas fa-globe me-2"></i>Live Preview
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="cc-btn-outline w-100 justify-content-center text-center py-2 d-flex align-items-center" style={{ fontSize: '.84rem' }}>
                        <i className="fab fa-github me-2"></i>GitHub Source
                      </a>
                    )}
                  </div>

                  {/* Team Requests Moderation (For Owner) */}
                  {isOwner && project.requests && project.requests.length > 0 && (
                    <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '28px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>Team Join Requests</div>
                      <div className="d-flex flex-column gap-3">
                        {project.requests.map((r) => (
                          <div key={r._id} style={{ border: '1px solid var(--cream)', padding: '14px', background: 'var(--paper)' }}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <strong style={{ fontSize: '.84rem', color: 'var(--ink)' }}>{r.userId?.name}</strong>
                              <span style={{ fontSize: '.64rem', color: '#888' }}>({r.status})</span>
                            </div>
                            {r.message && <p style={{ fontSize: '.8rem', color: '#555', margin: '0 0 10px', fontStyle: 'italic' }}>"{r.message}"</p>}
                            {r.status === 'pending' && (
                              <div className="d-flex gap-2">
                                <button onClick={() => handleModerateRequest(r._id, 'accept')} className="btn btn-sm btn-success py-1 px-3" style={{ fontSize: '.7rem', borderRadius: 0 }}>Accept</button>
                                <button onClick={() => handleModerateRequest(r._id, 'reject')} className="btn btn-sm btn-danger py-1 px-3" style={{ fontSize: '.7rem', borderRadius: 0 }}>Reject</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
