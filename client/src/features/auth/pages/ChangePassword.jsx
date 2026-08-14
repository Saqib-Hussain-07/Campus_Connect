import React, { useState } from 'react';


export default function ChangePassword() {
  const token = localStorage.getItem('campusconnect_token');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
      setError('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Confirm password does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to change password');

      setMessage(data.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '36px', boxShadow: '4px 4px 0px var(--ink)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>Security Settings</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', marginBottom: '28px' }}>Change Password</h3>

                  {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}
                  {message && <div className="alert alert-success p-3 mb-4">{message}</div>}

                  <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <div>
                      <label className="cc-form-label">Current Password *</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="cc-form-input"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div>
                      <label className="cc-form-label">New Password * <span style={{ fontSize: '.65rem', color: '#aaa' }}>(min 8 chars)</span></label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="cc-form-input"
                        placeholder="Enter new password"
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
                      {loading ? 'Updating password…' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
