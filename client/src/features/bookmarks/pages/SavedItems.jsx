import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import BookmarkButton from '../../../components/ui/BookmarkButton';
import Loader from '../../../components/Loader';
import { useToast } from '../../../context/ToastContext';

export default function SavedItems() {
  const { addToast } = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/bookmarks');
      if (res.data?.success) {
        setBookmarks(res.data.data?.bookmarks || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load bookmarks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const projects = bookmarks.filter((b) => b.itemType === 'project');
  const events = bookmarks.filter((b) => b.itemType === 'event');
  const groups = bookmarks.filter((b) => b.itemType === 'group');
  const resources = bookmarks.filter((b) => b.itemType === 'resource');

  const displayedBookmarks =
    activeFilter === 'all'
      ? bookmarks
      : bookmarks.filter((b) => b.itemType === activeFilter);

  const filters = [
    { id: 'all', label: 'All Saved', count: bookmarks.length },
    { id: 'project', label: 'Projects', count: projects.length },
    { id: 'event', label: 'Events', count: events.length },
    { id: 'group', label: 'Study Circles', count: groups.length },
    { id: 'resource', label: 'Resources', count: resources.length }
  ];

  return (
    <div style={{ background: 'var(--paper)', minHeight: 'calc(100vh - 92px)', padding: '32px 0 60px' }}>
      <div className="container">
        {/* Header Banner */}
        <div
          style={{
            background: 'var(--ink)',
            padding: '32px 40px',
            color: '#fff',
            marginBottom: '24px',
            boxShadow: '4px 4px 0 var(--rust)'
          }}
        >
          <div className="cc-section-label white-lbl">Personal Library</div>
          <h1 className="cc-heading on-dark" style={{ fontSize: '2.4rem', margin: '6px 0 8px' }}>
            SAVED ITEMS &amp; BOOKMARKS
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', margin: 0, fontSize: '.9rem' }}>
            Quick access to your bookmarked campus projects, upcoming events, study circles, and resources.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="cc-btn"
              style={{
                padding: '8px 16px',
                fontSize: '.78rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                background: activeFilter === f.id ? 'var(--ink)' : 'var(--white)',
                color: activeFilter === f.id ? 'var(--paper)' : 'var(--ink)',
                border: '1.5px solid var(--ink)',
                boxShadow: activeFilter === f.id ? '2px 2px 0 var(--rust)' : '2px 2px 0 var(--ink)',
                cursor: 'pointer'
              }}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {loading ? (
          <Loader message="Loading your bookmarks..." />
        ) : displayedBookmarks.length === 0 ? (
          <div
            className="text-center py-5"
            style={{
              background: 'var(--white)',
              border: '2px solid var(--ink)',
              padding: '48px 24px',
              boxShadow: '4px 4px 0 var(--ink)'
            }}
          >
            <i className="far fa-bookmark fa-3x mb-3 text-rust"></i>
            <h4>No Bookmarks Found</h4>
            <p style={{ color: '#4b5563', fontSize: '.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              You haven't saved any {activeFilter === 'all' ? 'items' : activeFilter + 's'} yet.
              Explore the campus directory to bookmark projects, events, or resources.
            </p>
            <Link to="/projects" className="cc-btn-fill" style={{ background: 'var(--rust)', color: '#fff', border: 'none', padding: '10px 24px' }}>
              Explore Projects →
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {displayedBookmarks.map((b) => {
              const item = b.item;
              if (!item) return null;

              return (
                <div key={b._id} className="col-md-6 col-lg-4">
                  <div
                    style={{
                      border: '2px solid var(--ink)',
                      background: 'var(--white)',
                      padding: '20px',
                      boxShadow: '3px 3px 0 var(--ink)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      position: 'relative'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        style={{
                          fontSize: '.65rem',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          color:
                            b.itemType === 'project'
                              ? 'var(--rust)'
                              : b.itemType === 'event'
                              ? 'var(--moss)'
                              : b.itemType === 'group'
                              ? 'var(--sky)'
                              : 'var(--gold)'
                        }}
                      >
                        ● {b.itemType}
                      </span>
                      <BookmarkButton
                        itemType={b.itemType}
                        itemId={item._id}
                        initialBookmarked={true}
                      />
                    </div>

                    <h5 style={{ fontWeight: '700', fontSize: '1.05rem', margin: '0 0 8px' }}>
                      {b.itemType === 'project' && (
                        <Link to={`/projects/${item._id}`} style={{ color: 'var(--ink)' }}>
                          {item.title}
                        </Link>
                      )}
                      {b.itemType === 'event' && (
                        <Link to="/events" style={{ color: 'var(--ink)' }}>
                          {item.title}
                        </Link>
                      )}
                      {b.itemType === 'group' && (
                        <Link to="/groups" style={{ color: 'var(--ink)' }}>
                          {item.name}
                        </Link>
                      )}
                      {b.itemType === 'resource' && (
                        <Link to="/resources" style={{ color: 'var(--ink)' }}>
                          {item.title}
                        </Link>
                      )}
                    </h5>

                    <p
                      style={{
                        fontSize: '.82rem',
                        color: '#4b5563',
                        flex: 1,
                        margin: '0 0 12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.description || item.subject || 'Saved campus item'}
                    </p>

                    <div
                      style={{
                        borderTop: '1px solid var(--cream)',
                        paddingTop: '10px',
                        fontSize: '.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#4b5563',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>Saved on {new Date(b.createdAt).toLocaleDateString()}</span>
                      {item.author?.name && <span>By {item.author.name}</span>}
                      {item.creator?.name && <span>By {item.creator.name}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
