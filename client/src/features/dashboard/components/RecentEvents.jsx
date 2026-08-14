import React from 'react';
import { Link } from 'react-router-dom';

function RecentEvents({ stEvents = [] }) {
  return (
    <div
      style={{
        border: '2px solid var(--ink)',
        background: 'var(--white)',
        padding: '24px',
        boxShadow: '3px 3px 0 var(--ink)',
        marginBottom: '24px'
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888' }}>
            Campus Calendar
          </div>
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', margin: '2px 0 0' }}>
            Upcoming Events
          </h5>
        </div>
        <Link
          to="/events"
          style={{
            fontSize: '.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--rust)',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
        >
          Browse All →
        </Link>
      </div>

      {stEvents && stEvents.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {stEvents.map((ev, idx) => {
            const dateObj = ev.eventDate ? new Date(ev.eventDate) : new Date();
            const monthStr = dateObj.toLocaleString('default', { month: 'short' });
            const dayStr = dateObj.getDate();

            return (
              <div
                key={idx}
                className="d-flex align-items-center gap-3 p-2"
                style={{
                  border: '1px solid #e0d8c8',
                  background: 'var(--paper)'
                }}
              >
                {/* Date Badge */}
                <div
                  style={{
                    background: 'var(--ink)',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '6px 10px',
                    minWidth: '46px',
                    flexShrink: 0
                  }}
                >
                  <div style={{ fontSize: '.58rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>
                    {monthStr}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1', fontFamily: 'var(--font-display)' }}>
                    {dayStr}
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-grow-1 min-width-0">
                  <h6 style={{ fontWeight: '700', fontSize: '.86rem', margin: '0 0 2px', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Link to="/events" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                      {ev.title}
                    </Link>
                  </h6>
                  <div style={{ fontSize: '.68rem', color: '#666', fontFamily: 'var(--font-mono)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>
                      <i className="fas fa-location-dot me-1 text-rust"></i>
                      {ev.isOnline ? 'Online Webinar' : (ev.venue || 'Campus Hall')}
                    </span>
                    {ev.category && (
                      <span style={{ textTransform: 'capitalize', color: 'var(--moss)' }}>
                        • {ev.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4" style={{ color: '#888', fontSize: '.85rem' }}>
          No upcoming events scheduled.{' '}
          <Link to="/events" style={{ color: 'var(--rust)', fontWeight: 'bold' }}>
            Explore events →
          </Link>
        </div>
      )}
    </div>
  );
}

export default React.memo(RecentEvents);
