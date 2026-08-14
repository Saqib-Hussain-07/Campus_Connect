import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function DashboardHeader({ user }) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const completionPercentage = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    if (user.name) score += 20;
    if (user.department) score += 20;
    if (user.semester) score += 20;
    if (user.university) score += 20;
    if (user.skills && user.skills.length > 0) score += 10;
    if (user.bio) score += 10;
    return score;
  }, [user]);

  return (
    <div className="mb-4">
      {/* Top Banner: Greeting, Department Tag, and Profile Completion */}
      <div
        style={{
          border: '2px solid var(--ink)',
          background: 'var(--white)',
          padding: '28px 32px',
          boxShadow: '4px 4px 0 var(--ink)',
          position: 'relative'
        }}
      >
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                style={{
                  background: 'var(--rust)',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '.62rem',
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  fontWeight: '700'
                }}
              >
                Campus Dashboard
              </span>
              {user?.department && (
                <span
                  style={{
                    border: '1px solid var(--ink)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '.62rem',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    color: 'var(--ink)'
                  }}
                >
                  {user.department} {user.semester ? `• Sem ${user.semester}` : ''}
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3.2rem',
                color: 'var(--ink)',
                margin: '0',
                lineHeight: '1.05',
                letterSpacing: '-0.02em'
              }}
            >
              Welcome back, <span style={{ color: 'var(--rust)' }}>{firstName}</span>.
            </h1>
            <p style={{ fontSize: '.88rem', color: '#666', marginTop: '6px', marginBottom: '0' }}>
              Here is what is happening across your campus network today.
            </p>
          </div>

          {/* Quick Profile Strength Widget */}
          <div
            style={{
              minWidth: '220px',
              background: 'var(--paper)',
              border: '1px solid #d3c9b9',
              padding: '12px 16px'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span style={{ fontSize: '.72rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--ink)' }}>
                Profile Strength
              </span>
              <span style={{ fontSize: '.76rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: completionPercentage === 100 ? 'var(--moss)' : 'var(--rust)' }}>
                {completionPercentage}%
              </span>
            </div>
            <div style={{ background: '#e0d8c8', height: '6px', width: '100%', overflow: 'hidden', marginBottom: '6px' }}>
              <div
                style={{
                  background: completionPercentage === 100 ? 'var(--moss)' : 'var(--rust)',
                  height: '100%',
                  width: `${completionPercentage}%`,
                  transition: 'width 0.5s ease-out'
                }}
              />
            </div>
            <Link
              to="/profile"
              style={{
                fontSize: '.66rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--rust)',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              {completionPercentage === 100 ? 'View Profile →' : 'Complete Profile (+20%) →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
