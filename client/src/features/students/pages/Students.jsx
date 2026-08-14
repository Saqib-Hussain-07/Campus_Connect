import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getAvatarUrl } from '../../../utils/avatar';
import { useStudents } from '../hooks/useStudents';

export default function Students() {
  const {
    students,
    loading,
    search,
    setSearch,
    department,
    setDepartment,
    university,
    setUniversity,
    semester,
    setSemester,
    skill,
    setSkill,
    handleSearchSubmit,
    handleReset,
    handleConnect,
    token
  } = useStudents();

  const avatarUrl = (u) => getAvatarUrl(u);

  const departments = [
    'Computer Science Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Electronics',
    'Chemical Engineering',
    'Data Science',
    'Business Administration',
    'UX & Design',
    'MCA (Postgraduate)'
  ];

  return (
    <div>
      <Navbar />

      <main id="main-content" tabIndex="-1" style={{ outline: 'none', marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12" style={{ minHeight: '100vh' }}>
            {/* Header Box (Flush with Navbar) */}
            <div style={{ background: 'var(--ink)', padding: '48px 40px', color: '#fff', marginBottom: '30px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>
                —— Student Network
              </div>
              <h1 className="cc-heading on-dark" style={{ fontSize: '4.5rem', fontWeight: 'normal', lineHeight: '0.95', margin: '0 0 12px 0' }}>
                EXPLORE <em>Peers</em>
              </h1>
              <p style={{ color: 'rgba(255,255,255,.4)', margin: '0', fontSize: '.9rem' }}>
                {students.length} students across {new Set(students.map(s => s.department)).size} departments.
              </p>
            </div>

            {/* Content Body */}
            <div className={token ? "px-4 pb-5" : "container pb-5"}>
              {/* Filter Form */}
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="row g-3">
                    <div className="col-lg-4 col-md-6">
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                        Search Students
                      </label>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Name, skill, or keyword..."
                        style={{
                          background: '#fafaf8',
                          border: '1px solid #d3c9b9',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          color: 'var(--ink)',
                          width: '100%',
                          outline: 'none',
                          borderRadius: '0',
                          height: '48px'
                        }}
                      />
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{
                          background: '#fafaf8',
                          border: '1px solid #d3c9b9',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          color: 'var(--ink)',
                          width: '100%',
                          outline: 'none',
                          borderRadius: '0',
                          height: '48px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-lg-2 col-md-6">
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        style={{
                          background: '#fafaf8',
                          border: '1px solid #d3c9b9',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          color: 'var(--ink)',
                          width: '100%',
                          outline: 'none',
                          borderRadius: '0',
                          height: '48px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Any</option>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-lg-3 col-md-6 d-flex align-items-end">
                      <button 
                        type="submit" 
                        style={{
                          background: 'var(--rust)',
                          color: 'var(--white)',
                          border: 'none',
                          padding: '12px 24px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          width: '100%',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rust-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--rust)'}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Students Grid */}
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                  Filtering Network…
                </div>
              ) : students.length > 0 ? (
                <div className="row g-4">
                  {students.map((student) => (
                    <div key={student._id} className="col-xl-4 col-md-6">
                      <div 
                        style={{ 
                          border: '1.5px solid var(--ink)', 
                          background: 'var(--white)', 
                          padding: '24px', 
                          minHeight: '280px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          {/* Profile Header Details */}
                          <div className="d-flex align-items-start gap-3 mb-3">
                            <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                              <img
                                src={avatarUrl(student)}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                                alt={student.name}
                                loading="lazy"
                                decoding="async"
                              />
                              {student.isOnline && (
                                <span style={{
                                  position: 'absolute',
                                  bottom: '-2px',
                                  right: '-2px',
                                  width: '10px',
                                  height: '10px',
                                  backgroundColor: '#22c55e',
                                  border: '1.5px solid var(--ink)',
                                  borderRadius: '50%'
                                }}></span>
                              )}
                            </div>
                            <div style={{ flexGrow: 1 }}>
                              <h4 style={{ fontWeight: 'bold', fontSize: '1.15rem', margin: '0 0 2px', fontFamily: 'var(--font-body)' }}>
                                <Link to={`/students/${student._id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{student.name}</Link>
                              </h4>
                              <div style={{ fontSize: '.74rem', color: '#666', fontFamily: 'var(--font-mono)' }}>
                                {student.department} {student.semester && `· Sem ${student.semester}`}
                              </div>
                              {student.university && (
                                <div style={{ fontSize: '.7rem', color: '#888', marginTop: '1px' }}>
                                  {student.university}
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--moss)', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px' }}>
                                <i className="fas fa-circle-check" style={{ color: '#2e7d32' }}></i> Verified
                              </div>
                            </div>
                          </div>

                          {/* Skill Tags */}
                          {student.skills && student.skills.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-3" style={{ marginTop: '16px' }}>
                              {student.skills.slice(0, 3).map((s, idx) => {
                                const isFirst = idx === 0;
                                return (
                                  <span key={idx} style={{
                                    fontSize: '0.6rem',
                                    fontFamily: 'var(--font-mono)',
                                    textTransform: 'uppercase',
                                    padding: '4px 8px',
                                    background: isFirst ? 'var(--rust)' : '#fafaf8',
                                    color: isFirst ? '#fff' : 'var(--ink)',
                                    border: isFirst ? '1px solid var(--rust)' : '1px solid #d3c9b9'
                                  }}>
                                    {s}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* Bio */}
                          <p style={{ fontSize: '0.82rem', color: '#444', lineHeight: '1.5', margin: '0 0 16px' }}>
                            {student.bio || 'Active campus network member.'}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div>
                          <Link to={`/students/${student._id}`} className="btn" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: '#fafaf8',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '0',
                            padding: '10px',
                            color: 'var(--ink)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            width: '100%',
                            marginBottom: '8px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#ede8d8'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fafaf8'}
                          >
                            View Profile <i className="fas fa-user" style={{ fontSize: '0.7rem' }}></i>
                          </Link>
                          {(!token || JSON.parse(localStorage.getItem('campusconnect_user'))?.id !== student._id) && (
                            <button 
                              onClick={() => handleConnect(student._id)} 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                background: '#fafaf8',
                                border: '1.5px solid var(--ink)',
                                borderRadius: '0',
                                padding: '10px',
                                color: 'var(--ink)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                width: '100%',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#ede8d8'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#fafaf8'}
                            >
                              Connect <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5" style={{ color: '#aaa', border: '1.5px dashed var(--cream)', background: '#fff' }}>
                  <i className="fas fa-user-slash fa-2x mb-3"></i>
                  <p>No students found matching your filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
