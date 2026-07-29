import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Progressive Lockout Timer State
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('campusconnect_token');
    const localUser = JSON.parse(localStorage.getItem('campusconnect_user'));
    if (token && localUser) {
      const isComplete = localUser.department && localUser.semester && localUser.university && localUser.skills && localUser.skills.length > 0 && localUser.bio;
      if (isComplete) {
        navigate('/projects');
      } else {
        navigate('/dashboard');
      }
    }
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
    }
  }, [navigate, location]);

  // Ticking countdown timer effect
  useEffect(() => {
    let timer;
    if (isLocked && lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutSeconds]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.locked || data.retryAfterSeconds) {
          setIsLocked(true);
          setLockoutSeconds(data.retryAfterSeconds || 300);
          setError('');
        } else {
          setError(data.message || 'Login failed');
        }
        return;
      }

      localStorage.setItem('campusconnect_token', data.token);
      localStorage.setItem('campusconnect_user', JSON.stringify(data.user));

      const u = data.user;
      const isComplete = u.department && u.semester && u.university && u.skills && u.skills.length > 0 && u.bio;

      if (isComplete) {
        window.location.href = '/projects';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0" style={{ minHeight: 'calc(100vh - 92px)' }}>
          {/* Left Panel */}
          <div className="col-lg-5 cc-auth-left d-none d-lg-flex" style={{ background: 'var(--ink)', padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', textAlign: 'center' }}>
            <div className="text-center">
              <i className="fas fa-graduation-cap" style={{ fontSize: '2.5rem', color: 'var(--paper)', marginBottom: '16px' }}></i>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '4.5rem', color: 'var(--paper)', lineHeight: '.95', letterSpacing: '.02em', textTransform: 'uppercase', fontWeight: 'normal', margin: '24px 0 16px' }}>
                Welcome<br />
                <span style={{ color: 'var(--rust)', fontStyle: 'italic', fontFamily: 'var(--font-serif)', textTransform: 'none' }}>Back</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,.4)', maxWidth: '300px', fontSize: '.9rem', lineHeight: '1.6', margin: '0 auto 36px' }}>
                Your campus network is waiting. Log in to connect, collaborate, and grow.
              </p>
              <div>
                <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,.3)', fontSize: '.76rem', fontFamily: 'var(--font-mono)', textDecoration: 'underline' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.3)'}
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-lg-7 cc-auth-right" style={{ background: 'var(--cream)', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ maxWidth: '440px', width: '100%', padding: '20px', textAlign: 'left' }}>
              <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', color: 'var(--ink)', marginBottom: '8px', lineHeight: '1', fontWeight: 'normal' }}>Login</h1>
              <p style={{ fontSize: '.88rem', color: '#666', marginBottom: '32px' }}>
                New here? <Link to="/register" style={{ color: 'var(--rust)', fontWeight: '700' }}>Create an account</Link>
              </p>

              {successMessage && (
                <div className="alert alert-success p-3 mb-4" style={{ borderRadius: '0', fontSize: '.84rem', borderLeft: '4px solid var(--moss, #2d4a3e)' }}>
                  <i className="fas fa-circle-check me-2" style={{ color: 'var(--moss)' }}></i>
                  {successMessage}
                </div>
              )}

              {/* Compact Lockout Alert with Live Timer */}
              {isLocked ? (
                <div className="alert alert-danger p-3 mb-4 d-flex align-items-center justify-content-between" style={{ borderRadius: '0', fontSize: '.84rem', borderLeft: '4px solid var(--rust, #e15b34)' }}>
                  <div>
                    <i className="fas fa-lock me-2"></i>
                    Too many failed attempts. Try again in:
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--rust, #e15b34)', background: '#fff', padding: '2px 8px', border: '1px solid #f5c6cb' }}>
                    {formatCountdown(lockoutSeconds)}
                  </span>
                </div>
              ) : error ? (
                <div className="alert alert-danger p-3 mb-4" style={{ borderRadius: '0', fontSize: '.84rem' }}>
                  <i className="fas fa-circle-exclamation me-2"></i>
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                    University Email
                  </label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="you@university.edu"
                    disabled={isLocked}
                    style={{
                      background: isLocked ? '#eee' : '#fafaf8',
                      border: '1px solid #d3c9b9',
                      padding: '12px 16px',
                      fontSize: '0.95rem',
                      color: 'var(--ink)',
                      width: '100%',
                      outline: 'none',
                      borderRadius: '0',
                      cursor: isLocked ? 'not-allowed' : 'text'
                    }} 
                    required 
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Your password"
                      disabled={isLocked}
                      style={{
                        background: isLocked ? '#eee' : '#fafaf8',
                        border: '1px solid #d3c9b9',
                        padding: '12px 16px',
                        paddingRight: '44px',
                        fontSize: '0.95rem',
                        color: 'var(--ink)',
                        width: '100%',
                        outline: 'none',
                        borderRadius: '0',
                        cursor: isLocked ? 'not-allowed' : 'text'
                      }} 
                      required 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLocked}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      <i className={`fas fa-eye${showPassword ? '' : '-slash'}`}></i>
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <Link to="/forgot-password" style={{ fontSize: '.76rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit */}
                <button 
                  type="submit" 
                  disabled={loading || isLocked}
                  style={{
                    background: isLocked ? '#aaa' : 'var(--rust)',
                    color: 'var(--white)',
                    border: 'none',
                    padding: '14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isLocked || loading ? 'not-allowed' : 'pointer',
                    marginTop: '12px',
                    transition: 'background 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => { if (!isLocked && !loading) e.currentTarget.style.background = 'var(--rust-light)'; }}
                  onMouseLeave={(e) => { if (!isLocked && !loading) e.currentTarget.style.background = 'var(--rust)'; }}
                >
                  {isLocked ? (
                    `LOCKED OUT (${formatCountdown(lockoutSeconds)})`
                  ) : loading ? (
                    'Logging in...'
                  ) : (
                    <>
                      Login
                      <i className="fas fa-arrow-right"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
