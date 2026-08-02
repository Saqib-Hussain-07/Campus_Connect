import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { getAvatarUrl } from '../utils/avatar';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('campusconnect_token');
  const { msgCount: unreadCount } = useNotifications();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;

    // Fetch user details
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => {});
  }, [token]);

  if (!token) return null;

  const handleLogout = async (e) => {
    e.preventDefault();
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
    navigate('/');
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const avatarUrl = (u) => getAvatarUrl(u);

  if (!user) {
    return (
      <div className="col-xl-2 col-lg-3 cc-dash-sidebar d-none d-lg-flex flex-column p-4 text-center">
        <div style={{ color: '#aaa', fontStyle: 'italic', fontSize: '.8rem' }}>Loading user details…</div>
      </div>
    );
  }

  return (
    <div className="col-xl-2 col-lg-3 cc-dash-sidebar d-none d-lg-flex flex-column">
      <div className="text-center mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div className="position-relative d-inline-block mb-2">
          <img
            src={avatarUrl(user)}
            style={{ width: '64px', height: '64px', objectFit: 'cover', border: '2px solid var(--rust)' }}
            alt={user.name}
          />
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              background: '#22c55e',
              borderRadius: '50%',
              border: '2px solid var(--ink)'
            }}
          ></span>
        </div>
        <div style={{ fontWeight: '700', fontSize: '.82rem', color: 'var(--paper)', lineHeight: 1.2 }}>
          {user.name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.58rem', color: 'var(--rust)', marginTop: '3px' }}>
          ● Online
        </div>
      </div>

      <nav className="flex-grow-1">
        <Link className={`cc-dash-nav-link ${isActive('/dashboard')}`} to="/dashboard">
          <i className="fas fa-house"></i>Dashboard
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/students')}`} to="/students">
          <i className="fas fa-users"></i>Students
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/projects')}`} to="/projects">
          <i className="fas fa-code"></i>Projects
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/groups')}`} to="/groups">
          <i className="fas fa-layer-group"></i>Groups
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/events')}`} to="/events">
          <i className="fas fa-calendar-days"></i>Events
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/notices')}`} to="/notices">
          <i className="fas fa-bullhorn"></i>Notices
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/resources')}`} to="/resources">
          <i className="fas fa-book-open"></i>Resources
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/leaderboard')}`} to="/leaderboard">
          <i className="fas fa-trophy"></i>Leaderboard
        </Link>

        <div style={{ height: '1px', background: 'rgba(255,255,255,.06)', margin: '10px 0' }}></div>

        <Link className={`cc-dash-nav-link ${isActive('/messages')}`} to="/messages">
          <i className="fas fa-comment-dots"></i>Messages
          {unreadCount > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                background: 'var(--rust)',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '.52rem',
                padding: '1px 5px',
                borderRadius: '8px'
              }}
            >
              {unreadCount}
            </span>
          )}
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/profile')}`} to="/profile">
          <i className="fas fa-user-pen"></i>Edit Profile
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/add-project')}`} to="/add-project">
          <i className="fas fa-plus-circle"></i>Post Project
        </Link>
        <Link className={`cc-dash-nav-link ${isActive('/contact')}`} to="/contact">
          <i className="fas fa-envelope"></i>Contact
        </Link>

        <div style={{ height: '1px', background: 'rgba(255,255,255,.06)', margin: '10px 0' }}></div>

        <a href="#logout" className="cc-dash-nav-link" onClick={handleLogout} style={{ color: 'rgba(220,53,69,.7)' }}>
          <i className="fas fa-sign-out-alt"></i>Logout
        </a>

        <div style={{ height: '1px', background: 'rgba(255,255,255,.06)', margin: '15px 0 10px 0' }}></div>

        <div className="d-flex align-items-center gap-2 px-2 py-2 rounded-3" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)' }}>
          <div className="cc-brand-mark" style={{ width: '20px', height: '20px' }}>
            <i className="fas fa-graduation-cap" style={{ fontSize: '8px' }}></i>
          </div>
          <div style={{ fontSize: '.68rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.7)' }}>
            CampusConnect <span style={{ color: 'var(--rust-light)', fontWeight: '600' }}>v1.0.0</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
