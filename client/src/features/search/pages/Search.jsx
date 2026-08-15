import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAvatarUrl } from '../../../utils/avatar';
import { useSearch } from '../hooks/useSearch';
import BookmarkButton from '../../../components/ui/BookmarkButton';
import ReportModal from '../../../components/ui/ReportModal';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(currentQuery);
  const [activeTab, setActiveTab] = useState('all');

  const [reportState, setReportState] = useState({
    isOpen: false,
    targetType: 'Project',
    targetId: '',
    targetTitle: ''
  });

  const { query, results, loading, token } = useSearch();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const openReport = (targetType, targetId, targetTitle) => {
    setReportState({
      isOpen: true,
      targetType,
      targetId,
      targetTitle
    });
  };

  const studentCount = results.students?.length || 0;
  const projectCount = results.projects?.length || 0;
  const groupCount = results.groups?.length || 0;
  const eventCount = results.events?.length || 0;
  const resourceCount = results.resources?.length || 0;
  const noticeCount = results.notices?.length || 0;
  const totalResults =
    studentCount + projectCount + groupCount + eventCount + resourceCount + noticeCount;

  const tabs = [
    { id: 'all', label: 'All Results', count: totalResults },
    { id: 'students', label: 'Students', count: studentCount },
    { id: 'projects', label: 'Projects', count: projectCount },
    { id: 'events', label: 'Events', count: eventCount },
    { id: 'groups', label: 'Study Circles', count: groupCount },
    { id: 'resources', label: 'Resources', count: resourceCount },
    { id: 'notices', label: 'Notices', count: noticeCount }
  ];

  return (
    <div style={{ background: 'var(--paper)', minHeight: 'calc(100vh - 92px)', padding: '24px 0 60px' }}>
      <div className="container">
        {/* Search Hero Header */}
        <div
          style={{
            background: 'var(--ink)',
            padding: '32px 40px',
            color: '#fff',
            marginBottom: '24px',
            boxShadow: '4px 4px 0 var(--rust)'
          }}
        >
          <div className="cc-section-label white-lbl">Global Discovery Engine</div>
          <h1 className="cc-heading on-dark" style={{ fontSize: '2.4rem', margin: '6px 0 16px' }}>
            CAMPUS DISCOVERY <em>{query ? `"${query}"` : ''}</em>
          </h1>

          {/* Direct Search Input */}
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '600px' }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search students, projects, events, study circles, materials..."
              className="cc-form-input"
              style={{
                height: '46px',
                background: '#fff',
                color: '#111',
                flex: 1,
                fontSize: '.9rem'
              }}
            />
            <button
              type="submit"
              className="cc-btn-fill px-4"
              style={{ height: '46px', background: 'var(--rust)', color: '#fff', border: 'none' }}
            >
              <i className="fas fa-search me-1"></i> Search
            </button>
          </form>
        </div>

        {/* Category Filter Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="cc-btn"
              style={{
                padding: '8px 16px',
                fontSize: '.78rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
                background: activeTab === tab.id ? 'var(--ink)' : 'var(--white)',
                color: activeTab === tab.id ? 'var(--paper)' : 'var(--ink)',
                border: '1.5px solid var(--ink)',
                boxShadow: activeTab === tab.id ? '2px 2px 0 var(--rust)' : '2px 2px 0 var(--ink)',
                cursor: 'pointer'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5" style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
            <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-rust d-block"></i>
            Searching campus database...
          </div>
        ) : totalResults === 0 && query ? (
          <div
            className="text-center py-5"
            style={{
              background: 'var(--white)',
              border: '2px solid var(--ink)',
              padding: '40px',
              boxShadow: '4px 4px 0 var(--ink)'
            }}
          >
            <i className="fas fa-magnifying-glass-arrow-right fa-3x mb-3 text-muted"></i>
            <h4>No matching results found for "{query}"</h4>
            <p style={{ color: '#4b5563', fontSize: '.9rem' }}>
              Try adjusting your keyword, checking for typos, or selecting another category filter.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {/* 1. Students */}
            {(activeTab === 'all' || activeTab === 'students') && studentCount > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', borderBottom: '2px solid var(--ink)', paddingBottom: '6px', marginBottom: '16px' }}>
                  Students ({studentCount})
                </h4>
                <div className="row g-3">
                  {results.students.map((student) => (
                    <div key={student._id} className="col-md-6 col-lg-4">
                      <div
                        style={{
                          border: '2px solid var(--ink)',
                          background: 'var(--white)',
                          padding: '16px',
                          boxShadow: '3px 3px 0 var(--ink)',
                          position: 'relative'
                        }}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <div className="d-flex align-items-center gap-3 min-width-0">
                          <img
                            src={getAvatarUrl(student)}
                            style={{ width: '46px', height: '46px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                            alt={student.name}
                          />
                          <div className="min-width-0">
                            <h6 style={{ fontWeight: '700', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Link to={`/students/${student._id}`} style={{ color: 'var(--ink)' }}>
                                {student.name}
                              </Link>
                            </h6>
                            <div style={{ fontSize: '.72rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                              {student.department}
                            </div>
                            {student.university && (
                              <div style={{ fontSize: '.68rem', color: '#4b5563' }}>
                                {student.university}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => openReport('User', student._id, student.name)}
                          className="cc-icon-btn flex-shrink-0"
                          title="Report Profile"
                          style={{ border: 'none', background: 'none', color: '#888' }}
                        >
                          <i className="fas fa-flag" style={{ fontSize: '12px' }}></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Projects */}
            {(activeTab === 'all' || activeTab === 'projects') && projectCount > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', borderBottom: '2px solid var(--ink)', paddingBottom: '6px', marginBottom: '16px' }}>
                  Projects &amp; Builds ({projectCount})
                </h4>
                <div className="row g-3">
                  {results.projects.map((proj) => (
                    <div key={proj._id} className="col-md-6">
                      <div
                        style={{
                          border: '2px solid var(--ink)',
                          background: 'var(--white)',
                          padding: '20px',
                          boxShadow: '3px 3px 0 var(--ink)',
                          position: 'relative'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span
                            style={{
                              background: 'var(--rust)',
                              color: '#fff',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '.62rem',
                              padding: '2px 8px',
                              textTransform: 'uppercase',
                              fontWeight: 'bold'
                            }}
                          >
                            {proj.category}
                          </span>
                          <div className="d-flex gap-2 align-items-center">
                            {token && <BookmarkButton itemType="project" itemId={proj._id} />}
                            <button
                              onClick={() => openReport('Project', proj._id, proj.title)}
                              className="cc-icon-btn"
                              title="Report Project"
                              style={{ border: 'none', background: 'none', color: '#888' }}
                            >
                              <i className="fas fa-flag" style={{ fontSize: '12px' }}></i>
                            </button>
                          </div>
                        </div>
                        <h5 style={{ fontWeight: '700', fontSize: '1.1rem', margin: '0 0 6px' }}>
                          <Link to={`/projects/${proj._id}`} style={{ color: 'var(--ink)' }}>
                            {proj.title}
                          </Link>
                        </h5>
                        <p
                          style={{
                            fontSize: '.82rem',
                            color: '#4b5563',
                            lineHeight: '1.4',
                            margin: '0 0 10px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {proj.description}
                        </p>
                        <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '.72rem', color: '#4b5563', fontFamily: 'var(--font-mono)' }}>
                          <span>By {proj.author?.name || 'Student'}</span>
                          <span><i className="fas fa-heart text-rust me-1"></i>{proj.likes?.length || 0} likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Events */}
            {(activeTab === 'all' || activeTab === 'events') && eventCount > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', borderBottom: '2px solid var(--ink)', paddingBottom: '6px', marginBottom: '16px' }}>
                  Events &amp; Workshops ({eventCount})
                </h4>
                <div className="row g-3">
                  {results.events.map((ev) => (
                    <div key={ev._id} className="col-md-6 col-lg-4">
                      <div
                        style={{
                          border: '2px solid var(--ink)',
                          background: 'var(--white)',
                          padding: '16px',
                          boxShadow: '3px 3px 0 var(--ink)'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span style={{ fontSize: '.68rem', fontFamily: 'var(--font-mono)', color: 'var(--moss)', fontWeight: 'bold' }}>
                            {ev.isOnline ? 'ONLINE WEBINAR' : 'CAMPUS VENUE'}
                          </span>
                          {token && <BookmarkButton itemType="event" itemId={ev._id} />}
                        </div>
                        <h6 style={{ fontWeight: '700', margin: '0 0 6px', fontSize: '.95rem' }}>
                          <Link to="/events" style={{ color: 'var(--ink)' }}>{ev.title}</Link>
                        </h6>
                        <div style={{ fontSize: '.72rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                          <i className="fas fa-calendar-day me-1"></i>
                          {new Date(ev.eventDate).toLocaleDateString()} · {ev.venue || 'Campus Hall'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Study Circles / Groups */}
            {(activeTab === 'all' || activeTab === 'groups') && groupCount > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', borderBottom: '2px solid var(--ink)', paddingBottom: '6px', marginBottom: '16px' }}>
                  Study Circles &amp; Clubs ({groupCount})
                </h4>
                <div className="row g-3">
                  {results.groups.map((group) => (
                    <div key={group._id} className="col-md-6 col-lg-4">
                      <div
                        style={{
                          border: '2px solid var(--ink)',
                          background: 'var(--white)',
                          padding: '16px',
                          boxShadow: '3px 3px 0 var(--ink)'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span style={{ fontSize: '.65rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--sky)', fontWeight: 'bold' }}>
                            {group.category || 'Study Circle'}
                          </span>
                          {token && <BookmarkButton itemType="group" itemId={group._id} />}
                        </div>
                        <h6 style={{ fontWeight: '700', margin: '0 0 4px' }}>
                          <Link to="/groups" style={{ color: 'var(--ink)' }}>{group.name}</Link>
                        </h6>
                        <p style={{ fontSize: '.78rem', color: '#4b5563', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {group.description}
                        </p>
                        <div style={{ fontSize: '.7rem', color: '#4b5563', fontFamily: 'var(--font-mono)' }}>
                          <i className="fas fa-users me-1"></i>{group.members?.length || 1} members
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Resources */}
            {(activeTab === 'all' || activeTab === 'resources') && resourceCount > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', borderBottom: '2px solid var(--ink)', paddingBottom: '6px', marginBottom: '16px' }}>
                  Academic Resources &amp; Notes ({resourceCount})
                </h4>
                <div className="row g-3">
                  {results.resources.map((res) => (
                    <div key={res._id} className="col-md-6 col-lg-4">
                      <div
                        style={{
                          border: '2px solid var(--ink)',
                          background: 'var(--white)',
                          padding: '16px',
                          boxShadow: '3px 3px 0 var(--ink)'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span style={{ fontSize: '.65rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 'bold' }}>
                            {res.fileType || 'PDF'}
                          </span>
                          {token && <BookmarkButton itemType="resource" itemId={res._id} />}
                        </div>
                        <h6 style={{ fontWeight: '700', margin: '0 0 4px' }}>
                          <Link to="/resources" style={{ color: 'var(--ink)' }}>{res.title}</Link>
                        </h6>
                        <div style={{ fontSize: '.72rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                          {res.subject} · {res.department}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Notices */}
            {(activeTab === 'all' || activeTab === 'notices') && noticeCount > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)', borderBottom: '2px solid var(--ink)', paddingBottom: '6px', marginBottom: '16px' }}>
                  Campus Notices ({noticeCount})
                </h4>
                <div className="row g-3">
                  {results.notices.map((notice) => (
                    <div key={notice._id} className="col-md-6">
                      <div
                        style={{
                          border: '2px solid var(--ink)',
                          background: 'var(--white)',
                          padding: '16px',
                          boxShadow: '3px 3px 0 var(--ink)'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span style={{ fontSize: '.65rem', fontFamily: 'var(--font-mono)', color: 'var(--rust)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {notice.category}
                          </span>
                          <span style={{ fontSize: '.62rem', color: '#888' }}>
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h6 style={{ fontWeight: '700', margin: '0 0 4px' }}>
                          <Link to="/notices" style={{ color: 'var(--ink)' }}>{notice.title}</Link>
                        </h6>
                        <p style={{ fontSize: '.78rem', color: '#4b5563', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {notice.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportState.isOpen}
        onClose={() => setReportState({ ...reportState, isOpen: false })}
        targetType={reportState.targetType}
        targetId={reportState.targetId}
        targetTitle={reportState.targetTitle}
      />
    </div>
  );
}
