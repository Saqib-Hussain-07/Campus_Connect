import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('campusconnect_token', data.token);
      localStorage.setItem('campusconnect_user', JSON.stringify(data.user));

      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '92px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
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

              {error && (
                <div className="alert alert-danger p-3 mb-4" style={{ borderRadius: '0', fontSize: '.84rem' }}>
                  <i className="fas fa-circle-exclamation me-2"></i>
                  {error}
                </div>
              )}

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
                    style={{
                      background: '#fafaf8',
                      border: '1px solid #d3c9b9',
                      padding: '12px 16px',
                      fontSize: '0.95rem',
                      color: 'var(--ink)',
                      width: '100%',
                      outline: 'none',
                      borderRadius: '0'
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
                      style={{
                        background: '#fafaf8',
                        border: '1px solid #d3c9b9',
                        padding: '12px 16px',
                        paddingRight: '44px',
                        fontSize: '0.95rem',
                        color: 'var(--ink)',
                        width: '100%',
                        outline: 'none',
                        borderRadius: '0'
                      }} 
                      required 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
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
                  disabled={loading}
                  style={{
                    background: 'var(--rust)',
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
                    cursor: 'pointer',
                    marginTop: '12px',
                    transition: 'background 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rust-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--rust)'}
                >
                  {loading ? 'Logging in...' : 'Login'}
                  <i className="fas fa-arrow-right"></i>
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
