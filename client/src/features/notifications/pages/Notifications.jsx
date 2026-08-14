import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';

import Footer from '../../../components/Footer';

export default function Notifications() {
  const token = localStorage.getItem('campusconnect_token');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {}
  };

  const notifIconMap = {
    connection_request: { icon: 'fa-user-plus', color: 'var(--rust)' },
    connection_accepted: { icon: 'fa-user-check', color: 'var(--moss)' },
    project_like: { icon: 'fa-heart', color: 'var(--rust)' },
    project_comment: { icon: 'fa-comment', color: 'var(--sky)' },
    project_join_request: { icon: 'fa-users', color: 'var(--gold)' },
    endorsement: { icon: 'fa-award', color: 'var(--gold)' },
    message_new: { icon: 'fa-comment-dots', color: 'var(--sky)' },
    notice_new: { icon: 'fa-bullhorn', color: 'var(--moss)' }
  };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div style={{ background: 'var(--ink)', padding: '24px 40px', color: '#fff', marginBottom: '30px' }}>
              <div className="cc-section-label white-lbl">Inbox Logs</div>
              <h1 className="cc-heading on-dark">MY <em>Notifications</em></h1>
              <p style={{ color: 'rgba(255,255,255,.4)', margin: '10px 0 0', fontSize: '.9rem' }}>
                Keep track of connection requests, skill endorsements, and project engagement.
              </p>
            </div>

            {/* Actions panel */}
            <div className="d-flex justify-content-end mb-4">
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAllRead}
                  className="cc-btn-fill"
                  style={{ border: 'none', padding: '10px 20px', fontSize: '.76rem' }}
                >
                  Mark All Read <i className="fas fa-check-double ms-1"></i>
                </button>
              )}
            </div>

            {/* List */}
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                Loading Notifications…
              </div>
            ) : notifications.length > 0 ? (
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {notifications.map((n) => {
                    const map = notifIconMap[n.type] || { icon: 'fa-bell', color: '#888' };
                    return (
                      <div
                        key={n._id}
                        className="d-flex align-items-start justify-content-between p-3"
                        style={{
                          borderBottom: '1px solid var(--cream)',
                          background: n.isRead ? 'transparent' : 'var(--cream)',
                          transition: 'background .2s'
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              background: map.color,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              flexShrink: 0
                            }}
                          >
                            <i className={`fas ${map.icon}`}></i>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--ink)' }}>{n.message}</p>
                            <div style={{ fontSize: '.68rem', color: '#999', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                              {new Date(n.createdAt).toLocaleDateString()} ·{' '}
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        {!n.isRead && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              background: 'var(--rust)',
                              borderRadius: '50%',
                              alignSelf: 'center'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-5" style={{ color: '#aaa', border: '1.5px dashed var(--cream)', background: '#fff' }}>
                <i className="fas fa-bell-slash fa-2x mb-3 text-rust"></i>
                <p>No notifications to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
