import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';

export default function RecentEvents({ stEvents = [] }) {
  return (
    <Card style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '14px' }}>
        My Events Calendar
      </div>
      {stEvents && stEvents.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {stEvents.map((ev, idx) => (
            <div key={idx} className="pb-3" style={{ borderBottom: idx < stEvents.length - 1 ? '1px solid var(--cream)' : 'none' }}>
              <h6 style={{ fontWeight: '700', fontSize: '.82rem', margin: '0 0 4px', color: 'var(--ink)' }}>{ev.title}</h6>
              <div style={{ fontSize: '.68rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                <i className="fas fa-calendar-alt me-1"></i>{new Date(ev.eventDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: '.8rem', color: '#aaa' }}>
          No upcoming events RSVP'd. <Link to="/events" style={{ color: 'var(--rust)' }}>Explore events.</Link>
        </div>
      )}
    </Card>
  );
}
