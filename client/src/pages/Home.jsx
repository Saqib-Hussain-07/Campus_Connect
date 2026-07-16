import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user'));

  const [data, setData] = useState(null);
  const [peerFilter, setPeerFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');

  const fetchHomeData = () => {
    fetch('/api/home')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setData(null));
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (!data) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.05 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [data, peerFilter, groupFilter]);

  const handleJoinGroup = async (groupId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`/api/content/groups/${groupId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchHomeData();
      }
    } catch (err) {}
  };

  if (!data) return <div className="loading">Loading CampusConnect…</div>;

  const { recentStudents, recentGroups, liveStats } = data;

  const heroImgs = [
    { src: 'https://picsum.photos/seed/collaboration/400/400', alt: 'Students collaborating in campus library' },
    { src: 'https://picsum.photos/seed/hackathon/400/400', alt: 'Students at a hackathon' },
    { src: 'https://picsum.photos/seed/campus/400/400', alt: 'University campus building' },
    { src: 'https://picsum.photos/seed/discussion/400/400', alt: 'Students discussing on campus lawn' }
  ];

  const firstStudent = recentStudents && recentStudents.length > 0 ? recentStudents[0] : null;

  // Peer filter matching helper
  const filteredStudents = (recentStudents || []).filter((student) => {
    if (peerFilter === 'all') return true;
    const dept = (student.department || '').toLowerCase();
    if (peerFilter === 'cs') {
      return dept.includes('computer') || dept.includes('science') || dept.includes('it') || dept.includes('mca') || dept.includes('data');
    }
    if (peerFilter === 'mech') {
      return dept.includes('mechanical') || dept.includes('robotics') || dept.includes('automobile');
    }
    if (peerFilter === 'biz') {
      return dept.includes('business') || dept.includes('mba') || dept.includes('bba');
    }
    if (peerFilter === 'design') {
      return dept.includes('design') || dept.includes('ux');
    }
    return false;
  });

  // Group filter matching helper
  const filteredGroups = (recentGroups || []).filter((g) => {
    if (groupFilter === 'all') return true;
    return g.type === groupFilter;
  });

  const groupBannerSeeds = ['group1', 'group2', 'group3', 'group4', 'group5', 'group6'];
  const groupAvatarSeeds = [['g1', 'g2', 'g3'], ['g4', 'g5', 'g6'], ['g7', 'g8', 'g9'], ['g10', 'g11'], ['g12', 'g13'], ['g14', 'g15']];
  const groupStatusLabel = { active: '● Active', recruiting: '◈ Recruiting', open: '○ Open' };

  const securityPoints = [
    { icon: 'fa-envelope-circle-check', title: 'University Email Verification', desc: 'Every account is verified through an official .edu email, ensuring only genuine students join.' },
    { icon: 'fa-lock', title: 'End-to-End Encryption', desc: 'All messages and data are encrypted in transit and at rest using industry-standard protocols.' },
    { icon: 'fa-sliders', title: 'Granular Privacy Controls', desc: 'Control who sees your profile, who can message you, and manage data visibility on your terms.' }
  ];

  const testimonialList = [
    { name: 'Ananya Gupta', role: 'IT Engineering · Pune', avatarSeed: 'test1', text: 'Campus Connect helped me find a study partner for Data Structures. We went from struggling to topping the class. Incredibly easy to find someone with the right skills.' },
    { name: 'Rohan Mehta', role: 'Computer Science · Mumbai', avatarSeed: 'test2', text: 'I found my hackathon team through the Project Partner Finder. We won the inter-college competition! Verified profiles gave me full confidence.' },
    { name: 'Divya Krishnan', role: 'Electronics · Chennai', avatarSeed: 'test3', text: 'As a first-year student, I felt lost. Study groups helped me integrate quickly. Career Connect gave me internship leads I would never have found otherwise.' }
  ];

  return (
    <div>
      <Navbar />

      {/* 1. HERO SECTION */}
      <section id="home" className="cc-hero">
        <div className="row g-0">
          <div className="col-lg-6">
            <div className="cc-hero-left">
              <div className="cc-hero-eyebrow reveal">{data.hero.eyebrow}</div>
              <h1 className="cc-hero-title reveal d1">
                {data.hero.title.map((line, idx) => (
                  <span key={idx}>
                    {idx > 0 && <br />}
                    {idx === 1 ? <span className="italic">{line}</span> : line}
                  </span>
                ))}
              </h1>
              <p className="cc-hero-subtitle mt-4 mb-5 reveal d2">{data.hero.subtitle}</p>
              <div className="d-flex gap-3 flex-wrap reveal d3">
                <Link to="/register" className="cc-btn-lg-dark">
                  <span>Get Started Free</span><i className="fas fa-arrow-right"></i>
                </Link>
                <Link to="/students" className="cc-btn-lg-ghost">
                  Browse Students <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
              <div className="d-flex align-items-center gap-0 mt-5 pt-4 reveal d4" style={{ borderTop: '1px solid var(--cream)' }}>
                {data.stats.map((stat, idx) => (
                  <div key={idx} className="cc-hero-stat me-4 pe-4" style={{ borderRight: idx < data.stats.length - 1 ? '1px solid var(--cream)' : 'none' }}>
                    <div className="cc-hero-stat-num">
                      <span>{stat.value}</span>
                    </div>
                    <div className="cc-hero-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6 cc-hero-right">
            <div className="cc-hero-grid">
              {heroImgs.map((img, idx) => (
                <div key={idx} className="cc-hero-cell">
                  <img src={img.src} alt={img.alt} />
                </div>
              ))}
            </div>
            <div className="cc-hero-badge">
              <span>Join<em>free</em></span>
            </div>

            {/* Hero Student Overlay Card */}
            {firstStudent && (
              <div className="cc-hero-overlay d-flex align-items-center gap-3">
                <img
                  className="cc-hero-avatar"
                  src={`https://picsum.photos/seed/${encodeURIComponent(firstStudent.name)}/100/100`}
                  alt={firstStudent.name}
                />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: '700', fontSize: '.9rem', color: 'var(--ink)' }}>{firstStudent.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: '#666' }}>
                    {firstStudent.department} · {firstStudent.university}
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {firstStudent.skills?.slice(0, 3).map((sk, sIdx) => (
                      <span key={sIdx} className={`cc-pill ${sIdx === 0 ? 'accent' : ''}`}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-end">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: firstStudent.isOnline ? '#22c55e' : '#94a3b8', borderRadius: '50%' }}></span>
                    {firstStudent.isOnline ? 'Online' : 'Offline'}
                  </div>
                  <Link
                    to={token ? `/students/${firstStudent._id}` : '/login'}
                    style={{
                      marginTop: '8px',
                      display: 'block',
                      padding: '6px 14px',
                      background: 'var(--ink)',
                      color: 'var(--paper)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '.72rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '.05em'
                    }}
                  >
                    Connect
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="cc-features">
        <div className="container">
          <div className="row g-5 align-items-end mb-5">
            <div className="col-lg-6">
              <div className="cc-section-label reveal">Platform Features</div>
              <h2 className="cc-heading reveal d1">Everything You Need to <em>Succeed Together</em></h2>
            </div>
            <div className="col-lg-6">
              <p className="reveal d2" style={{ fontSize: '1.02rem', lineHeight: 1.7, color: '#555' }}>
                Campus Connect gives every student the tools to find the right people, collaborate on what matters, and build a network that goes beyond graduation.
              </p>
            </div>
          </div>
          <div className="cc-features-border-wrap">
            <div className="row g-0">
              {data.features.map((feature, idx) => (
                <div key={idx} className="col-lg-4 col-md-6">
                  <div className={`cc-feature-card reveal d${(idx % 3) + 1}`}>
                    <div className="fc-num">{feature[0]} / Feature</div>
                    <div className="fc-icon">
                      <i className={`fas ${feature[1]}`}></i>
                    </div>
                    <div className="fc-title">{feature[2]}</div>
                    <div className="fc-desc">{feature[3]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how" className="cc-how">
        <div className="container">
          <div className="cc-section-label reveal">Simple Process</div>
          <h2 className="cc-heading on-dark reveal d1">Four Steps to <em>Your Network</em></h2>
          <div className="cc-how-border">
            <div className="row g-0">
              {data.steps.map((step, idx) => (
                <div key={idx} className="col-lg-3 col-md-6">
                  <div className={`cc-how-step reveal d${idx + 1}`}>
                    <div className="cc-step-num">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="cc-step-icon">
                      <i className={`fas ${step[0]}`}></i>
                    </div>
                    <div className="cc-step-title">{step[1]}</div>
                    <div className="cc-step-desc">{step[2]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE PEERS (STUDENTS GRID) */}
      <section id="students-section" className="cc-students">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
            <div>
              <div className="cc-section-label reveal">Student Network</div>
              <h2 className="cc-heading reveal d1">Explore <em>Peers</em></h2>
            </div>
            <Link to="/students" className="cc-btn-lg-dark reveal d2">
              <span>Browse All</span><i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          {/* Filter strip */}
          <div className="cc-filter-strip mb-2 reveal d1">
            <button onClick={() => setPeerFilter('all')} className={`cc-filter-btn ${peerFilter === 'all' ? 'active' : ''}`}>All</button>
            <button onClick={() => setPeerFilter('cs')} className={`cc-filter-btn ${peerFilter === 'cs' ? 'active' : ''}`}>Computer Science</button>
            <button onClick={() => setPeerFilter('mech')} className={`cc-filter-btn ${peerFilter === 'mech' ? 'active' : ''}`}>Mechanical</button>
            <button onClick={() => setPeerFilter('biz')} className={`cc-filter-btn ${peerFilter === 'biz' ? 'active' : ''}`}>Business</button>
            <button onClick={() => setPeerFilter('design')} className={`cc-filter-btn ${peerFilter === 'design' ? 'active' : ''}`}>Design</button>
          </div>

          {/* Grid list */}
          {filteredStudents.length > 0 ? (
            <div className="cc-students-grid">
              {filteredStudents.map((stu, idx) => (
                <div key={stu._id} className={`cc-student-card reveal d${(idx % 3) + 1}`}>
                  <div className="d-flex gap-3 align-items-start mb-3">
                    <div className="position-relative flex-shrink-0">
                      <img
                        className="cc-student-avatar"
                        src={`https://picsum.photos/seed/${encodeURIComponent(stu.name)}/120/120`}
                        alt={stu.name}
                      />
                      <span className={`cc-status-dot ${stu.isOnline ? 'online' : 'offline'}`}></span>
                    </div>
                    <div>
                      <div className="cc-student-name">{stu.name}</div>
                      <div className="cc-student-dept">
                        {stu.department} · {stu.semester ? `Sem ${stu.semester}` : 'Student'}
                      </div>
                      <div className="cc-student-verified">
                        <i className="fas fa-check-circle"></i> Verified
                      </div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {stu.skills?.slice(0, 3).map((sk, skIdx) => (
                      <span key={skIdx} className={`cc-pill ${skIdx === 0 ? 'accent' : ''}`}>
                        {sk}
                      </span>
                    ))}
                  </div>
                  <Link to={token ? `/students/${stu._id}` : '/login'} className="cc-student-btn">
                    View Profile <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 bg-white border" style={{ color: '#aaa', borderTop: '1px solid var(--ink)' }}>
              No recent student records match this filter.
            </div>
          )}
        </div>
      </section>

      {/* 5. COLLABORATION & GROUPS */}
      <section id="groups-section" className="cc-groups">
        <div className="container">
          <div className="row g-5 align-items-end mb-4">
            <div className="col-lg-6">
              <div className="cc-section-label reveal">Communities</div>
              <h2 className="cc-heading reveal d1">Collaboration &amp; <em>Groups</em></h2>
            </div>
            <div className="col-lg-6">
              <p className="reveal d2" style={{ fontSize: '1rem', lineHeight: '1.7', color: '#555' }}>
                Join study circles, form project teams, or engage in open discussions — all in one place.
              </p>
            </div>
          </div>

          <div className="cc-tab-strip mb-4 reveal">
            <button onClick={() => setGroupFilter('all')} className={`cc-tab-btn ${groupFilter === 'all' ? 'active' : ''}`}>All Groups</button>
            <button onClick={() => setGroupFilter('study')} className={`cc-tab-btn ${groupFilter === 'study' ? 'active' : ''}`}>Study</button>
            <button onClick={() => setGroupFilter('project')} className={`cc-tab-btn ${groupFilter === 'project' ? 'active' : ''}`}>Projects</button>
            <button onClick={() => setGroupFilter('forum')} className={`cc-tab-btn ${groupFilter === 'forum' ? 'active' : ''}`}>Forums</button>
          </div>

          {filteredGroups.length > 0 ? (
            <div className="row g-3">
              {filteredGroups.map((grp, idx) => {
                const isMember = loggedInUser && grp.members?.includes(loggedInUser.id);
                const avatars = groupAvatarSeeds[idx % groupAvatarSeeds.length];
                const banner = `https://picsum.photos/seed/${groupBannerSeeds[idx % groupBannerSeeds.length]}/600/300`;

                return (
                  <div key={grp._id} className="col-lg-4 col-md-6">
                    <div className={`cc-group-card reveal d${(idx % 3) + 1}`}>
                      <div className="cc-group-banner">
                        <img src={banner} alt="" />
                        <span className={`cc-group-type-badge badge-${grp.type}`}>{grp.type}</span>
                        <div className="cc-group-banner-text">{grp.name}</div>
                      </div>
                      <div className="cc-group-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className={`cc-group-status ${grp.status}`}>{groupStatusLabel[grp.status]}</span>
                          <span className="cc-group-members">
                            <i className="fas fa-users me-1"></i>{grp.members ? grp.members.length : 0} members
                          </span>
                        </div>
                        <p className="cc-group-desc mb-3" style={{ height: '52px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {grp.description}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex">
                            {avatars.map((av) => (
                              <img key={av} className="cc-group-avatar" src={`https://picsum.photos/seed/${av}/40/40`} alt="" />
                            ))}
                          </div>
                          <button onClick={() => handleJoinGroup(grp._id)} className="cc-group-join">
                            {isMember ? 'Joined' : grp.type === 'project' ? 'Apply Now' : 'Join Group'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5 bg-white border" style={{ color: '#aaa' }}>
              No study circles match this filter.
            </div>
          )}
        </div>
      </section>

      {/* 6. SECURITY FIRST */}
      <section id="security" className="cc-security">
        <div className="container">
          <div className="row g-5 align-items-center">
            {/* Visual Ring */}
            <div className="col-lg-5 d-flex justify-content-center reveal from-left">
              <div className="cc-sec-float-wrap">
                <div className="cc-sec-ring">
                  <div className="cc-sec-ring-inner">
                    <div className="cc-sec-center"><i className="fas fa-shield-halved"></i></div>
                  </div>
                </div>
                <div className="cc-sec-float" style={{ top: '10px', left: '50%', transform: 'translateX(-50%)' }}>
                  <i className="fas fa-lock"></i><span>End-to-End Encrypted</span>
                </div>
                <div className="cc-sec-float" style={{ bottom: '30px', left: 0 }}>
                  <i className="fas fa-fingerprint"></i><span>Biometric Auth</span>
                </div>
                <div className="cc-sec-float" style={{ bottom: '100px', right: 0 }}>
                  <i className="fas fa-user-check"></i><span>Verified Accounts</span>
                </div>
              </div>
            </div>

            {/* Content Points */}
            <div className="col-lg-7 reveal from-right">
              <div className="cc-section-label light">Security First</div>
              <h2 className="cc-heading on-dark mb-4">Your Safety Is Our <em>Priority</em></h2>
              <div className="d-flex flex-column gap-4">
                {securityPoints.map((pt, idx) => (
                  <div key={idx} className="cc-sec-point">
                    <div className="cc-sec-point-icon">
                      <i className={`fas ${pt.icon}`}></i>
                    </div>
                    <div>
                      <div className="cc-sec-point-title">{pt.title}</div>
                      <div className="cc-sec-point-desc">{pt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LIVE STATISTICS COUNTS */}
      <section id="stats" className="cc-stats">
        <div className="container">
          <div className="cc-section-label white-lbl reveal">By The Numbers</div>
          <h2 className="cc-heading on-dark reveal d1">Growing <em style={{ color: 'rgba(255,255,255,.4)' }}>Every Day</em></h2>
          <div className="cc-stats-grid row g-0 mt-4 reveal d2">
            {[
              { score: liveStats?.userCount || 0, label: 'Total Students' },
              { score: liveStats?.connCount || 0, label: 'Connections Made' },
              { score: liveStats?.groupCount || 0, label: 'Groups Created' },
              { score: liveStats?.messageCount || 0, label: 'Messages Exchanged' }
            ].map((sd, idx) => (
              <div key={idx} className="col-lg-3 col-6">
                <div className="cc-stat-item">
                  <div className="cc-stat-big">
                    <span>{sd.score}+</span>
                  </div>
                  <div className="cc-stat-lbl">{sd.label}</div>
                  <div className="cc-stat-bar counted"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section id="testimonials" className="cc-testimonials">
        <div className="container">
          <div className="cc-section-label reveal">Student Stories</div>
          <h2 className="cc-heading reveal d1 mb-5">What <em>Students</em> Say</h2>

          <div className="cc-testi-grid">
            {testimonialList.map((t, idx) => (
              <div key={idx} className={`cc-testi-item reveal d${idx + 1}`}>
                <span className="cc-testi-quote">"</span>
                <div className="cc-testi-star mb-2">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="cc-testi-text">{t.text}</p>
                <div className="d-flex align-items-center gap-3">
                  <img
                    className="cc-testi-avatar"
                    src={`https://picsum.photos/seed/${t.avatarSeed}/80/80`}
                    alt={t.name}
                  />
                  <div>
                    <div className="cc-testi-name">{t.name}</div>
                    <div className="cc-testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION (CTA) */}
      <section className="cc-cta">
        <div className="cc-cta-bg-text">JOIN</div>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="cc-section-label reveal justify-content-center">Ready?</div>
          <h2 className="cc-cta-heading reveal d1 mb-4">Join Your<br />Campus<br /><em>Network</em></h2>
          <p className="cc-cta-sub mx-auto reveal d2">
            Start connecting with students, join study groups, and unlock new academic and career opportunities — completely free.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap mt-4 reveal d3">
            <Link to="/register" className="cc-btn-cta-fill">Sign Up Free <i className="fas fa-arrow-right"></i></Link>
            <Link to="/login" className="cc-btn-cta-ghost">Login</Link>
          </div>
          <p className="cc-footer-copy mt-4 reveal d4" style={{ color: 'rgba(255,255,255,.25)' }}>
            Free forever for students · No credit card required
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
