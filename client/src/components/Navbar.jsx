import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, token: authToken } = useAuth();
  const token = authToken || localStorage.getItem('campusconnect_token');
  const [localUser, setLocalUser] = useState(() => {
    try {
      const stored = localStorage.getItem('campusconnect_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const user = authUser || localUser;
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // Collapse navbar on route changes
  useEffect(() => {
    setIsNavCollapsed(true);
  }, [location]);

  const exploreTimer = useRef(null);
  const notifTimer = useRef(null);
  const userTimer = useRef(null);

  const handleMouseEnterExplore = () => {
    if (exploreTimer.current) clearTimeout(exploreTimer.current);
    setShowExploreMenu(true);
  };

  const handleMouseLeaveExplore = () => {
    exploreTimer.current = setTimeout(() => {
      setShowExploreMenu(false);
    }, 250);
  };

  const handleMouseEnterNotif = () => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setShowNotifMenu(true);
  };

  const handleMouseLeaveNotif = () => {
    notifTimer.current = setTimeout(() => {
      setShowNotifMenu(false);
    }, 250);
  };

  const handleMouseEnterUser = () => {
    if (userTimer.current) clearTimeout(userTimer.current);
    setShowUserMenu(true);
  };

  const handleMouseLeaveUser = () => {
    userTimer.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 250);
  };

  // Fetch current user & badges if token exists
  useEffect(() => {
    if (!token) return;

    // Fetch user details
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setLocalUser(data))
      .catch(() => {
        // Token might be invalid/expired, clear it
        localStorage.removeItem('campusconnect_token');
        localStorage.removeItem('campusconnect_user');
      });

    // Fetch notification log & badges
    const fetchBadges = () => {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data);
          setNotifCount(data.filter((n) => !n.isRead).length);
        })
        .catch(() => {});

      fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          const unreadSum = data.reduce((acc, conv) => acc + (conv.unread || 0), 0);
          setMsgCount(unreadSum);
        })
        .catch(() => {});
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {}
    }
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_user');
    if ('caches' in window) {
      try {
        await caches.delete('campusconnect-dynamic-v2');
      } catch (err) {}
    }
    setLocalUser(null);
    navigate('/');
    window.location.reload();
  };

  const handleMarkAllRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const avatarUrl = (u) => {
    if (u?.avatar && u.avatar.startsWith('data:')) {
      return u.avatar; // base64 uploaded image
    }
    if (u?.avatar && u.avatar !== 'default.jpg') {
      return `/assets/uploads/avatars/${u.avatar}`;
    }
    return getAvatarUrl(u?.name);
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
    <>
      <a href="#main-content" className="cc-skip-link">
        Skip to main content
      </a>

      {/* Ticker Board */}
      <div className="cc-ticker">
        <div className="cc-ticker-inner">
          {[
            'Projects Showcase — See what students are building',
            'Hackathons and Events — RSVP now',
            'Notice Board — Internships and Opportunities',
            'Study Resources — Shared by students for students',
            'Leaderboard — Top contributors this month',
            'Verified University Accounts Only',
            'End-to-End Encrypted Messages',
            '25,000+ Students · 1,200+ Groups · 50+ Universities'
          ].flatMap((tick) => [tick, tick]).map((tick, idx) => (
            <span key={idx}>
              {tick} <span className="cc-ticker-sep">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-xl cc-navbar sticky-top" aria-label="Main navigation">
        <div className="container-fluid px-3 px-lg-4">
          <Link className="navbar-brand cc-brand d-flex align-items-center gap-2" to="/" aria-label="CampusConnect Home">
            <div className="cc-brand-mark">
              <i className="fas fa-graduation-cap" aria-hidden="true"></i>
            </div>
            Campus<span className="cc-brand-accent">Connect</span>
          </Link>

          <button
            className="navbar-toggler cc-toggler border-0 ms-2"
            type="button"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            aria-controls="ccNavbarContent"
            aria-expanded={!isNavCollapsed}
            aria-label="Toggle navigation menu"
          >
            <i className="fas fa-bars"></i>
          </button>

          <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="ccNavbarContent">
            <div className="cc-menu-label d-xl-none">Discover</div>
            <ul className="navbar-nav mx-auto align-items-center gap-0">
              <li className="nav-item">
                <Link className="nav-link cc-nav-link" to="/students">
                  <i className="fas fa-users me-1 cc-nav-icon"></i>Students
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link cc-nav-link" to="/projects">
                  <i className="fas fa-code me-1 cc-nav-icon"></i>Projects
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link cc-nav-link" to="/groups">
                  <i className="fas fa-layer-group me-1 cc-nav-icon"></i>Groups
                </Link>
              </li>

              {/* Explore Dropdown */}
              <li
                className={`nav-item dropdown d-none d-xl-block ${showExploreMenu ? 'show' : ''}`}
                onMouseEnter={handleMouseEnterExplore}
                onMouseLeave={handleMouseLeaveExplore}
              >
                <span className="nav-link cc-nav-link dropdown-toggle" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-compass me-1 cc-nav-icon"></i>Explore
                </span>
                <ul className={`dropdown-menu cc-dropdown-menu shadow-lg p-2 ${showExploreMenu ? 'show' : ''}`}>
                  <li>
                    <Link className="dropdown-item cc-dd-item" to="/events">
                      <div className="cc-dd-icon" style={{ background: 'var(--rust)' }}>
                        <i className="fas fa-calendar-days"></i>
                      </div>
                      <div>
                        <div className="cc-dd-title">Events & Hackathons</div>
                        <div className="cc-dd-sub">RSVP to campus events</div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item cc-dd-item" to="/notices">
                      <div className="cc-dd-icon" style={{ background: 'var(--moss)' }}>
                        <i className="fas fa-bullhorn"></i>
                      </div>
                      <div>
                        <div className="cc-dd-title">Notice Board</div>
                        <div className="cc-dd-sub">Internships & opportunities</div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item cc-dd-item" to="/resources">
                      <div className="cc-dd-icon" style={{ background: 'var(--sky)' }}>
                        <i className="fas fa-book-open"></i>
                      </div>
                      <div>
                        <div className="cc-dd-title">Study Resources</div>
                        <div className="cc-dd-sub">Notes, videos & tools</div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" style={{ borderColor: 'var(--cream)', margin: '4px 8px' }} />
                  </li>
                  <li>
                    <Link className="dropdown-item cc-dd-item" to="/leaderboard">
                      <div className="cc-dd-icon" style={{ background: 'var(--gold)' }}>
                        <i className="fas fa-trophy"></i>
                      </div>
                      <div>
                        <div className="cc-dd-title">Leaderboard</div>
                        <div className="cc-dd-sub">Top students this month</div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item cc-dd-item" to="/contact">
                      <div className="cc-dd-icon" style={{ background: '#64748b' }}>
                        <i className="fas fa-envelope"></i>
                      </div>
                      <div>
                        <div className="cc-dd-title">Contact Us</div>
                        <div className="cc-dd-sub">Get in touch</div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </li>
              {/* Mobile Only Flat Links */}
              <li className="nav-item d-xl-none">
                <Link className="nav-link cc-nav-link" to="/events">
                  <i className="fas fa-calendar-days me-1 cc-nav-icon"></i>Events
                </Link>
              </li>
              <li className="nav-item d-xl-none">
                <Link className="nav-link cc-nav-link" to="/notices">
                  <i className="fas fa-bullhorn me-1 cc-nav-icon"></i>Notice Board
                </Link>
              </li>
              <li className="nav-item d-xl-none">
                <Link className="nav-link cc-nav-link" to="/resources">
                  <i className="fas fa-book-open me-1 cc-nav-icon"></i>Study Resources
                </Link>
              </li>
              <li className="nav-item d-xl-none">
                <Link className="nav-link cc-nav-link" to="/leaderboard">
                  <i className="fas fa-trophy me-1 cc-nav-icon"></i>Leaderboard
                </Link>
              </li>
            </ul>

            {/* Global Search */}
            <form onSubmit={handleSearchSubmit} className="d-flex gap-0 ms-auto me-3" style={{ minWidth: '180px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                style={{
                  padding: '7px 12px',
                  border: '1.5px solid var(--cream)',
                  background: 'var(--paper)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '.8rem',
                  color: 'var(--ink)',
                  outline: 'none',
                  flex: 1,
                  minWidth: 0
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '7px 12px',
                  background: 'var(--ink)',
                  border: '1.5px solid var(--ink)',
                  color: 'var(--paper)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <i className="fas fa-search" style={{ fontSize: '12px' }}></i>
              </button>
            </form>

            {/* User Widgets */}
            <div className="cc-navbar-actions d-flex align-items-center gap-2">
              {token && user ? (
                <>
                  {/* Messages Icon Button */}
                  <Link className="cc-icon-btn position-relative" to="/messages" title="Messages">
                    <i className="fas fa-comment-dots"></i>
                    {msgCount > 0 && (
                      <span className="cc-badge cc-msg-badge">{msgCount > 9 ? '9+' : msgCount}</span>
                    )}
                  </Link>

                  {/* Notifications Icon Button & Menu */}
                  <div
                    className={`dropdown ${showNotifMenu ? 'show' : ''}`}
                    onMouseEnter={handleMouseEnterNotif}
                    onMouseLeave={handleMouseLeaveNotif}
                  >
                    <button className="cc-icon-btn position-relative" title="Notifications">
                      <i className="fas fa-bell"></i>
                      {notifCount > 0 && (
                        <span className="cc-badge cc-notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                      )}
                    </button>
                    <div
                      className={`dropdown-menu cc-notif-menu dropdown-menu-end shadow-lg p-0 ${
                        showNotifMenu ? 'show' : ''
                      }`}
                      style={{ minWidth: '300px', maxWidth: '340px' }}
                    >
                      <div className="cc-notif-header d-flex justify-content-between align-items-center">
                        <span>Notifications</span>
                        {notifCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              fontSize: '.62rem',
                              color: 'var(--rust)',
                              fontFamily: 'var(--font-mono)',
                              cursor: 'pointer'
                            }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                          notifications.map((n) => {
                            const map = notifIconMap[n.type] || { icon: 'fa-bell', color: '#888' };
                            return (
                              <Link
                                key={n._id}
                                to="/notifications"
                                className={`cc-notif-item d-flex align-items-start gap-2 ${
                                  n.isRead ? '' : 'cc-notif-unread'
                                }`}
                                style={{ padding: '10px 12px', borderBottom: '1px solid var(--cream)' }}
                              >
                                <div
                                  className="cc-notif-icon flex-shrink-0"
                                  style={{
                                    background: map.color,
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    color: '#fff',
                                    fontSize: '11px'
                                  }}
                                >
                                  <i className={`fas ${map.icon}`}></i>
                                </div>
                                <div className="flex-grow-1 min-width-0">
                                  <div className="cc-notif-msg" style={{ fontSize: '.78rem', color: 'var(--ink)' }}>
                                    {n.message}
                                  </div>
                                  <div
                                    className="cc-notif-time"
                                    style={{ fontSize: '.6rem', color: '#999', marginTop: '2px' }}
                                  >
                                    {new Date(n.createdAt).toLocaleDateString()} ·{' '}
                                    {new Date(n.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                {!n.isRead && <div className="cc-notif-dot flex-shrink-0"></div>}
                              </Link>
                            );
                          })
                        ) : (
                          <div className="text-center py-4" style={{ color: '#aaa', fontSize: '.82rem' }}>
                            <i className="fas fa-bell-slash d-block mb-2" style={{ fontSize: '1.4rem' }}></i>
                            No notifications yet
                          </div>
                        )}
                      </div>
                      <div className="cc-notif-footer text-center">
                        <Link to="/notifications">View All Notifications</Link>
                      </div>
                    </div>
                  </div>

                  {/* Profile Menu Dropdown */}
                  <div
                    className={`dropdown ${showUserMenu ? 'show' : ''}`}
                    onMouseEnter={handleMouseEnterUser}
                    onMouseLeave={handleMouseLeaveUser}
                  >
                    <button className="cc-user-btn d-flex align-items-center gap-2">
                      <img
                        src={avatarUrl(user)}
                        style={{ width: '28px', height: '28px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                        alt={user?.name || 'User'}
                      />
                      <span className="d-none d-xxl-inline">{user?.name ? user.name.split(' ')[0] : 'User'}</span>
                      <i className="fas fa-chevron-down" style={{ fontSize: '.55rem', color: '#888' }}></i>
                    </button>
                    <ul className={`dropdown-menu cc-dropdown-menu dropdown-menu-end shadow-lg p-2 ${showUserMenu ? 'show' : ''}`} style={{ minWidth: '210px' }}>
                      <li className="px-3 py-2" style={{ borderBottom: '1px solid var(--cream)' }}>
                        <div style={{ fontWeight: '700', fontSize: '.84rem', color: 'var(--ink)' }}>{user?.name || 'User'}</div>
                        <div style={{ fontSize: '.68rem', color: '#888', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {user?.email || ''}
                        </div>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/dashboard">
                          <i className="fas fa-house me-2"></i>Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          <i className="fas fa-user-pen me-2"></i>Edit Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/change-password">
                          <i className="fas fa-key me-2"></i>Change Password
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/delete-account" style={{ color: 'var(--rust)' }}>
                          <i className="fas fa-trash-can me-2"></i>Delete Account
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" style={{ borderColor: 'var(--cream)' }} />
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item"
                          style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                        >
                          <i className="fas fa-sign-out-alt me-2"></i>Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn cc-btn-outline">
                    Login
                  </Link>
                  <Link to="/register" className="btn cc-btn-fill">
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
