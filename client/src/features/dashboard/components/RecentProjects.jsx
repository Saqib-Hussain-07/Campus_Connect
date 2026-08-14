import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';

export default function RecentProjects({ myProjects = [] }) {
  const catColors = { web: 'sky', mobile: 'moss', ml: 'rust', hardware: 'gold', research: 'dark', other: 'rust' };
  const catIcons = { web: 'fa-globe', mobile: 'fa-mobile-screen', ml: 'fa-brain', hardware: 'fa-microchip', research: 'fa-flask', other: 'fa-code' };

  return (
    <Card style={{ padding: '28px', marginBottom: '24px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>
            Builds Showcase
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', margin: 0 }}>
            My Projects
          </h4>
        </div>
        <Link to="/add-project" style={{ fontSize: '.76rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '700' }}>
          + Post Project
        </Link>
      </div>

      {myProjects && myProjects.length > 0 ? (
        <div className="row g-3">
          {myProjects.map((p) => {
            const variant = catColors[p.category] || 'rust';
            const ic = catIcons[p.category] || 'fa-code';
            return (
              <div key={p._id} className="col-md-6">
                <div style={{ border: '1px solid var(--cream)', padding: '16px', background: 'var(--white)' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge variant={variant}>
                      <i className={`fas ${ic} me-1`}></i>{p.category}
                    </Badge>
                    <span style={{ fontSize: '.65rem', fontFamily: 'var(--font-mono)', color: p.status === 'completed' ? 'var(--moss)' : 'var(--rust)' }}>
                      ● {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h5 style={{ fontWeight: '700', fontSize: '.95rem', margin: '4px 0 8px' }}>
                    <Link to={`/projects/${p._id}`} style={{ color: 'var(--ink)' }}>{p.title}</Link>
                  </h5>
                  <div className="d-flex gap-3 text-muted" style={{ fontSize: '.68rem', fontFamily: 'var(--font-mono)' }}>
                    <span><i className="fas fa-heart me-1"></i>{p.likes ? p.likes.length : 0} likes</span>
                    <span><i className="fas fa-eye me-1"></i>{p.views || 0} views</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4" style={{ color: '#aaa', fontSize: '.84rem' }}>
          You haven't posted any projects yet. <Link to="/add-project" style={{ color: 'var(--rust)' }}>Create your first listing.</Link>
        </div>
      )}
    </Card>
  );
}
