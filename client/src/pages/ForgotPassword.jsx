import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setResetUrl('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Request failed');

      setMessage(data.message);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
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
      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)', display: 'flex', alignItems: 'center' }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '48px', boxShadow: '4px 4px 0px var(--ink)' }}>
                <div className="cc-section-label">Account Security</div>
                <h1 className="cc-heading mb-3">Forgot Password</h1>
                <p className="fc-desc mb-4">Enter your registered university email to receive a password reset link.</p>

                {error && <div className="alert alert-danger p-3 mb-3">{error}</div>}
                {message && (
                  <div className="alert alert-success p-3 mb-3">
                    {message}
                    {resetUrl && (
                      <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,.1)' }}>
                        <strong>Reset Link (Demo Mode):</strong><br />
                        <a href={resetUrl} style={{ wordBreak: 'break-all', fontSize: '.8rem', color: 'var(--rust)' }}>
                          {resetUrl}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="cc-form-label">University Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="cc-form-input"
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                  <button type="submit" className="cc-btn-fill w-100 py-3" disabled={loading}>
                    {loading ? 'Sending link…' : 'Send Reset Link'}
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
