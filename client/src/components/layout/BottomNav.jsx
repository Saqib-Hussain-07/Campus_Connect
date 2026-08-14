import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { useNotifications } from '../../features/notifications';

export default function BottomNav() {
  const location = useLocation();
  const { user, token } = useAuth();
  const { msgCount } = useNotifications();

  const navItems = [
    {
      to: token ? '/dashboard' : '/',
      label: 'Home',
      icon: 'fa-house',
      exact: true
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: 'fa-code-branch'
    },
    {
      to: '/events',
      label: 'Events',
      icon: 'fa-calendar-days'
    },
    {
      to: token ? '/messages' : '/login',
      label: 'Messages',
      icon: 'fa-comment-dots',
      badge: msgCount > 0 ? (msgCount > 9 ? '9+' : msgCount) : null
    },
    {
      to: token ? '/profile' : '/login',
      label: token ? 'Profile' : 'Login',
      icon: token ? 'fa-user' : 'fa-arrow-right-to-bracket'
    }
  ];

  return (
    <nav
      className="cc-bottom-nav d-md-none"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--paper, #f5f0e8)',
        borderTop: '2px solid var(--ink, #111)',
        zIndex: 1040,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        boxShadow: '0 -3px 10px rgba(0,0,0,0.08)'
      }}
    >
      {navItems.map((item, idx) => {
        const isActive = item.exact
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={idx}
            to={item.to}
            className="cc-bottom-nav-item"
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
              textDecoration: 'none',
              color: isActive ? 'var(--rust, #e15b34)' : 'var(--ink, #111)',
              background: isActive ? 'rgba(201, 79, 44, 0.08)' : 'transparent',
              position: 'relative',
              transition: 'background 0.15s ease, color 0.15s ease',
              outline: 'none',
              padding: '6px 2px'
            }}
          >
            {/* Active Top Line Indicator */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '20%',
                  right: '20%',
                  height: '3px',
                  background: 'var(--rust, #e15b34)'
                }}
              />
            )}

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <i
                className={`fas ${item.icon}`}
                style={{
                  fontSize: '1.25rem',
                  display: 'block',
                  color: isActive ? 'var(--rust, #e15b34)' : 'var(--ink, #111)'
                }}
                aria-hidden="true"
              ></i>

              {/* Notification / Unread Badge */}
              {item.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-10px',
                    background: 'var(--rust, #e15b34)',
                    color: '#fff',
                    fontSize: '0.62rem',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-mono, monospace)',
                    borderRadius: '10px',
                    padding: '1px 5px',
                    lineHeight: '1.2',
                    border: '1.5px solid var(--paper, #f5f0e8)'
                  }}
                  aria-label={`${item.badge} unread items`}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.65rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: isActive ? '800' : '600',
                marginTop: '3px',
                lineHeight: '1'
              }}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
