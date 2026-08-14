import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

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
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#aaa' }}>
            Dashboard Overview
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', color: 'var(--ink)', marginTop: '4px' }}>
            Hello, <span style={{ color: 'var(--rust)' }}>{firstName}</span>.
          </h2>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/add-project">
            <Button variant="secondary" size="md">
              <span>Post Project</span>
              <i className="fas fa-plus ms-1"></i>
            </Button>
          </Link>
          <Link to="/students">
            <Button variant="outline" size="md">
              <span>Find Students</span>
              <i className="fas fa-arrow-right ms-1"></i>
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Completion Progress Bar */}
      <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '16px 20px' }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div style={{ fontSize: '.78rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
            <i className="fas fa-id-card me-2" style={{ color: 'var(--rust)' }}></i>
            Profile Strength: <span style={{ color: 'var(--rust)' }}>{completionPercentage}%</span>
          </div>
          <Link to="/profile" style={{ fontSize: '.7rem', fontFamily: 'var(--font-mono)', color: 'var(--rust)', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Edit Profile →
          </Link>
        </div>
        <div style={{ background: 'var(--cream)', height: '8px', width: '100%', overflow: 'hidden' }}>
          <div
            style={{
              background: completionPercentage === 100 ? 'var(--moss)' : 'var(--rust)',
              height: '100%',
              width: `${completionPercentage}%`,
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
      </div>
    </div>
  );
}
