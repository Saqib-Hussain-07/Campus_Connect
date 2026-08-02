import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [token, setToken] = useState(() => searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email.trim() || !token.trim()) {
      setError('Both email and reset token are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const resData = await authService.resetPassword(email.trim(), token.trim(), password);
      setMessage(resData.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const isFromUrl = Boolean(searchParams.get('email') && searchParams.get('token'));

  return (
    <div>
      <Navbar />
      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)', display: 'flex', alignItems: 'center' }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '48px', boxShadow: '4px 4px 0px var(--ink)' }}>
                <div className="cc-section-label">Account Security</div>
                <h1 className="cc-heading mb-3">Reset Password</h1>
                <p className="fc-desc mb-4">Set a strong new password for your account.</p>

                {error && <div className="alert alert-danger p-3 mb-3">{error}</div>}
                {message && <div className="alert alert-success p-3 mb-3">{message} Redirecting to login…</div>}

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  {!isFromUrl && (
                    <>
                      <div>
                        <label className="cc-form-label">University Email *</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="cc-form-input"
                          placeholder="you@university.edu"
                          required
                        />
                      </div>
                      <div>
                        <label className="cc-form-label">Reset Token *</label>
                        <input
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="cc-form-input"
                          placeholder="Paste your reset token here"
                          required
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="cc-form-label">New Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="cc-form-input"
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="cc-form-label">Confirm New Password *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="cc-form-input"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                  <button type="submit" className="cc-btn-fill w-100 py-3 mt-2" disabled={loading}>
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
