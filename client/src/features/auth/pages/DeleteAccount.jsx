import React, { useState } from 'react';

import { useAuth } from '../../auth';
import { authService } from '../../../services/authService';

export default function DeleteAccount() {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirmCheckbox) {
      setError('Please check the confirmation box first.');
      return;
    }
    if (!password) {
      setError('Please enter your password to confirm deletion.');
      return;
    }
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE in the confirmation box.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.deleteAccount(password, confirmText);
      await logout();
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
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
                <div style={{ border: '1.5px solid var(--rust)', background: 'var(--white)', padding: '36px', boxShadow: '4px 4px 0px var(--ink)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rust)', marginBottom: '8px' }}>Danger Zone</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', marginBottom: '28px' }}>Delete Account</h3>

                  {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}

                  <p style={{ fontSize: '.9rem', color: '#555', lineHeight: '1.6' }} className="mb-4">
                    Deleting your account is permanent and cannot be undone. All your profile information, shared projects, study groups created, notifications, and chat histories will be permanently wiped out from our databases.
                  </p>

                  <form onSubmit={handleDelete}>
                    <div className="mb-3">
                      <label className="cc-form-label">Account Password *</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="cc-form-input"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="cc-form-label">Type "DELETE" to confirm *</label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="cc-form-input"
                        placeholder="DELETE"
                        required
                      />
                    </div>

                    <div className="form-check mb-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="confirmCheck"
                        checked={confirmCheckbox}
                        onChange={(e) => setConfirmCheckbox(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="confirmCheck" style={{ fontSize: '.84rem', userSelect: 'none', cursor: 'pointer', fontWeight: '600' }}>
                        I understand that this action is irreversible and I want to delete my account.
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="btn cc-btn-fill w-100 py-3"
                      style={{ border: '1.5px solid var(--rust)', background: 'var(--rust)', color: '#fff', fontSize: '.8rem' }}
                      disabled={loading}
                    >
                      {loading ? 'Deleting Account…' : 'Delete Account Permanently'}
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
