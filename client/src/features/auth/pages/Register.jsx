import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function Register() {
  const navigate = useNavigate();

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
  }, [navigate]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    registrationNo: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.registrationNo.trim()) errs.registrationNo = 'Registration number is required.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrs = validateForm();
    if (Object.keys(validationErrs).length > 0) {
      setErrors(validationErrs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          registrationNo: form.registrationNo.trim(),
          password: form.password
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to login page on successful registration
      navigate('/login', { 
        state: { 
          registered: true, 
          message: 'Account created successfully! Please login to set up your profile.' 
        } 
      });
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0" style={{ minHeight: 'calc(100vh - 92px)' }}>
          {/* Left panel */}
          <div className="col-lg-5 cc-auth-left d-none d-lg-flex" style={{ background: 'var(--ink)', padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
            <div className="text-center">
              <div className="cc-brand-mark mx-auto mb-4" style={{ width: '56px', height: '56px' }}>
                <i className="fas fa-graduation-cap" style={{ fontSize: '20px', color: 'var(--paper)' }}></i>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--paper)', lineHeight: '.9', letterSpacing: '.02em' }}>
                Start Your<br /><span style={{ color: 'var(--rust)' }}>Journey</span>
              </h2>
              <p className="mt-4" style={{ color: 'rgba(255,255,255,.4)', maxWidth: '280px', fontSize: '.9rem', lineHeight: '1.6', margin: '0 auto' }}>
                Join 25,000+ verified students finding study partners, building projects, and growing their network.
              </p>
              <div className="mt-5 d-flex flex-column gap-3 align-items-center">
                {['Verified university accounts only', 'Direct peer-to-peer messaging', 'Free forever for students'].map((f, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 text-start" style={{ color: 'rgba(255,255,255,.55)', fontSize: '.84rem', width: '220px' }}>
                    <i className="fas fa-check-circle" style={{ color: 'var(--rust)' }}></i>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="col-lg-7 cc-auth-right" style={{ background: 'var(--cream)', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="cc-auth-form-card" style={{ maxWidth: '500px', width: '100%', background: 'var(--white)', padding: '36px', border: '1.5px solid var(--ink)', boxShadow: '4px 4px 0px var(--ink)' }}>
              <h1 className="cc-auth-heading mb-1" style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Create Account</h1>
              <p className="mb-4" style={{ fontSize: '.88rem', color: '#888' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--rust)', fontWeight: '700' }}>Login</Link>
              </p>

              {errors.server && (
                <div className="alert alert-danger p-3 mb-3" style={{ borderRadius: '0', fontSize: '.8rem' }}>
                  <i className="fas fa-triangle-exclamation me-2"></i>
                  {errors.server}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-12">
                    <label className="cc-form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="e.g. Priya Sharma"
                      required
                    />
                    {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                  </div>

                  {/* University Email */}
                  <div className="col-12">
                    <label className="cc-form-label">University Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="you@university.edu"
                      required
                    />
                    {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                  </div>

                  {/* Registration No */}
                  <div className="col-12">
                    <label className="cc-form-label">Registration No *</label>
                    <input
                      type="text"
                      name="registrationNo"
                      value={form.registrationNo}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.registrationNo ? 'is-invalid' : ''}`}
                      placeholder="e.g. CC/2026/0045"
                      required
                    />
                    {errors.registrationNo && <div className="invalid-feedback d-block">{errors.registrationNo}</div>}
                  </div>

                  {/* Password */}
                  <div className="col-md-6">
                    <label className="cc-form-label">Password * <span style={{ fontSize: '.65rem', color: '#aaa' }}>(min 8 chars)</span></label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      required
                    />
                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                  </div>

                  {/* Confirm Password */}
                  <div className="col-md-6">
                    <label className="cc-form-label">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={`cc-form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                    />
                    {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
                  </div>

                  {/* Submit button */}
                  <div className="col-12 mt-2">
                    <button
                      type="submit"
                      className="cc-btn-fill py-3 w-100"
                      style={{ fontSize: '.84rem', textTransform: 'uppercase', letterSpacing: '.05em', border: 'none' }}
                      disabled={loading}
                    >
                      {loading ? 'Creating Account…' : 'Create Account'} <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
