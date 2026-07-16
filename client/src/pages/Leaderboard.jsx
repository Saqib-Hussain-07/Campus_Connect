import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

export default function Leaderboard() {
  const token = localStorage.getItem('campusconnect_token');
  const [activeTab, setActiveTab] = useState('connections');
  const [data, setData] = useState({ connections: [], builders: [], endorsed: [], groupers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/general/leaderboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getActiveList = () => {
    return data[activeTab] || [];
  };

  const getScoreLabel = (item) => {
    if (activeTab === 'connections') {
      return `${item.conn_count} connection${item.conn_count !== 1 ? 's' : ''}`;
    }
    if (activeTab === 'builders') {
      return `${item.total_likes} like${item.total_likes !== 1 ? 's' : ''} on ${item.project_count} project${item.project_count !== 1 ? 's' : ''}`;
    }
    if (activeTab === 'endorsed') {
      return `${item.endorse_count} endorsement${item.endorse_count !== 1 ? 's' : ''}`;
    }
    if (activeTab === 'groupers') {
      return `${item.group_count} group${item.group_count !== 1 ? 's' : ''}`;
    }
    return '';
  };

  const getShortScore = (item) => {
    if (activeTab === 'connections') return `${item.conn_count} connects`;
    if (activeTab === 'builders') return `${item.total_likes} likes`;
    if (activeTab === 'endorsed') return `${item.endorse_count} endorsements`;
    if (activeTab === 'groupers') return `${item.group_count} groups`;
    return '';
  };

  const getSubLabel = (item) => {
    if (activeTab === 'connections') {
      return item.department || '';
    }
    if (activeTab === 'builders') {
      return item.department || '';
    }
    if (activeTab === 'endorsed' && item.endorsed_skills) {
      return `Skills: ${item.endorsed_skills}`;
    }
    return item.department || '';
  };

  const tabs = [
    { id: 'connections', icon: 'fa-user-check', label: 'Most Connected' },
    { id: 'builders', icon: 'fa-code', label: 'Top Builders' },
    { id: 'endorsed', icon: 'fa-award', label: 'Most Endorsed' },
    { id: 'groupers', icon: 'fa-layer-group', label: 'Most Active' }
  ];

  const medalColors = ['var(--gold)', '#94a3b8', '#c9843c'];
  const medalLabels = ['🥇', '🥈', '🥉'];

  const currentList = getActiveList();
  const first = currentList[0];
  const second = currentList[1];
  const third = currentList[2];

  const remaining = currentList.slice(3);

  const avatarUrl = (item) => {
    if (item.avatar && item.avatar.startsWith('data:')) {
      return item.avatar;
    }
    if (item.avatar && item.avatar !== 'default.jpg') {
      return `/assets/uploads/avatars/${item.avatar}`;
    }
    return `https://picsum.photos/seed/${encodeURIComponent(item.name || 'user')}/120/120`;
  };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '92px', background: 'var(--paper)', minHeight: '100vh' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className={token ? "" : "container py-4"}>
              
              {/* Header */}
              <div style={{ background: 'var(--ink)', padding: '24px 40px', color: '#fff', marginBottom: '30px' }}>
                <div className="cc-section-label white-lbl">Campus Rankings</div>
                <h1 className="cc-heading on-dark">LEADER<em>board</em></h1>
                <p style={{ color: 'rgba(255,255,255,.4)', margin: '10px 0 0', fontSize: '.95rem' }}>
                  The most connected, most active, and most endorsed students on campus this semester.
                </p>
              </div>

              {/* Tab buttons */}
              <div className="cc-tab-strip mb-5" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1.5px solid var(--ink)', paddingBottom: '10px' }}>
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`btn ${activeTab === t.id ? 'cc-btn-fill' : 'cc-btn-outline'}`}
                    style={{ borderRadius: 0, textTransform: 'uppercase', fontSize: '.74rem', padding: '10px 20px', border: '1.5px solid var(--ink)' }}
                  >
                    <i className={`fas ${t.icon} me-2`}></i>{t.label}
                  </button>
                ))}
              </div>

              {/* Podium Top 3 */}
              {!loading && currentList.length >= 3 && (
                <div className="row justify-content-center g-3 mb-5 align-items-end">
                  
                  {/* 2nd place (Left) */}
                  {second && (
                    <div className="col-md-3 col-sm-4 order-2 order-sm-1">
                      <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', textAlign: 'center', boxShadow: '2px 2px 0 var(--ink)', height: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '1.4rem' }}>🥈</div>
                        <div style={{ position: 'relative', display: 'inline-block', margin: '6px 0 8px' }}>
                          <img src={avatarUrl(second)} style={{ width: '48px', height: '48px', objectFit: 'cover', border: `2.5px solid ${medalColors[1]}` }} alt={second.name} />
                        </div>
                        <h5 style={{ fontWeight: '700', fontSize: '.9rem', margin: '0 0 2px' }}>{second.name}</h5>
                        <div style={{ fontSize: '.7rem', color: '#888', fontFamily: 'var(--font-mono)' }}>{second.department}</div>
                        <div style={{ fontSize: '.76rem', color: 'var(--rust)', fontWeight: '700', marginTop: '4px' }}>{getShortScore(second)}</div>
                        <Link to={`/students/${second.id}`} style={{ display: 'block', marginTop: '8px', fontSize: '.7rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>View Profile →</Link>
                      </div>
                    </div>
                  )}

                  {/* 1st place (Center) */}
                  {first && (
                    <div className="col-md-3 col-sm-4 order-1 order-sm-2">
                      <div style={{ border: '2px solid var(--gold)', background: 'rgba(201,168,76,.04)', padding: '28px', textAlign: 'center', boxShadow: '4px 4px 0 var(--gold)', height: '230px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '1.8rem' }}>🥇</div>
                        <div style={{ position: 'relative', display: 'inline-block', margin: '8px 0 10px' }}>
                          <img src={avatarUrl(first)} style={{ width: '64px', height: '64px', objectFit: 'cover', border: `3px solid ${medalColors[0]}` }} alt={first.name} />
                        </div>
                        <h4 style={{ fontWeight: '700', fontSize: '1.05rem', margin: '0 0 4px', color: 'var(--rust)' }}>{first.name}</h4>
                        <div style={{ fontSize: '.74rem', color: '#666', fontFamily: 'var(--font-mono)' }}>{first.department}</div>
                        <div style={{ fontSize: '.84rem', color: 'var(--ink)', fontWeight: '800', marginTop: '6px' }}>{getShortScore(first)}</div>
                        <Link to={`/students/${first.id}`} style={{ display: 'block', marginTop: '10px', fontSize: '.74rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>View Profile →</Link>
                      </div>
                    </div>
                  )}

                  {/* 3rd place (Right) */}
                  {third && (
                    <div className="col-md-3 col-sm-4 order-3 order-sm-3">
                      <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', textAlign: 'center', boxShadow: '2px 2px 0 var(--ink)', height: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '1.2rem' }}>🥉</div>
                        <div style={{ position: 'relative', display: 'inline-block', margin: '6px 0 8px' }}>
                          <img src={avatarUrl(third)} style={{ width: '40px', height: '40px', objectFit: 'cover', border: `2.5px solid ${medalColors[2]}` }} alt={third.name} />
                        </div>
                        <h5 style={{ fontWeight: '700', fontSize: '.9rem', margin: '0 0 2px' }}>{third.name}</h5>
                        <div style={{ fontSize: '.7rem', color: '#888', fontFamily: 'var(--font-mono)' }}>{third.department}</div>
                        <div style={{ fontSize: '.76rem', color: 'var(--rust)', fontWeight: '700', marginTop: '4px' }}>{getShortScore(third)}</div>
                        <Link to={`/students/${third.id}`} style={{ display: 'block', marginTop: '8px', fontSize: '.7rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>View Profile →</Link>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Leaderboard Table Standings */}
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--cream)', background: 'var(--paper)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa' }}>
                    Full Rankings stand · {activeTab}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5" style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                    Computing Rankings…
                  </div>
                ) : currentList.length > 0 ? (
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--ink)' }}>
                          <th style={{ padding: '12px 24px', fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.10em', textTransform: 'uppercase', color: '#aaa', textAlign: 'left', width: '80px' }}>#</th>
                          <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.10em', textTransform: 'uppercase', color: '#aaa', textAlign: 'left' }}>Student</th>
                          <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.10em', textTransform: 'uppercase', color: '#aaa', textAlign: 'left' }}>Department</th>
                          <th style={{ padding: '12px 24px', fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.10em', textTransform: 'uppercase', color: '#aaa', textAlign: 'right' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentList.map((item, idx) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--cream)', transition: 'background .15s' }}>
                            <td style={{ padding: '14px 24px', fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: idx < 3 ? medalColors[idx] : '#ccc' }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={avatarUrl(item)}
                                  style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                                  alt={item.name}
                                />
                                <div>
                                  <Link to={`/students/${item.id}`} style={{ fontWeight: '700', fontSize: '.88rem', color: 'var(--ink)', textDecoration: 'none' }}>
                                    {item.name}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '.78rem', color: '#888', fontFamily: 'var(--font-mono)' }}>
                              {getSubLabel(item)}
                            </td>
                            <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--rust)' }}>
                                {getScoreLabel(item)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5" style={{ color: '#aaa' }}>
                    No ranked users found for this category.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
