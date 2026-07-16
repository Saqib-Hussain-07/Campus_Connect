import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm) {
      setError('Please check the confirmation box first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to delete account');

      localStorage.removeItem('campusconnect_token');
      localStorage.removeItem('campusconnect_user');
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '92px', background: 'var(--paper)', minHeight: '100vh' }}>
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

                  <div className="form-check mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="confirmCheck"
                      checked={confirm}
                      onChange={(e) => setConfirm(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label" htmlFor="confirmCheck" style={{ fontSize: '.84rem', userSelect: 'none', cursor: 'pointer', fontWeight: '600' }}>
                      I understand that this action is irreversible and I want to delete my account.
                    </label>
                  </div>

                  <button
                    onClick={handleDelete}
                    className="btn cc-btn-fill"
                    style={{ border: '1.5px solid var(--rust)', padding: '12px 28px', background: 'var(--rust)', color: '#fff', fontSize: '.8rem' }}
                    disabled={loading}
                  >
                    {loading ? 'Deleting Account…' : 'Delete Account Permanently'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
