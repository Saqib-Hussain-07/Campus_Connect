import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../../components/Navbar';

import Footer from '../../../components/Footer';

export default function CreateGroup() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('campusconnect_token');

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: location, message: 'Please log in to create study groups or forums.' } });
    }
  }, [token, navigate, location]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'study',
    status: 'active'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/content/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create group');

      navigate('/groups');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '36px', boxShadow: '4px 4px 0px var(--ink)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>Study Circles</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', marginBottom: '28px' }}>Create Study Group</h3>

                  {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Name */}
                      <div className="col-12">
                        <label className="cc-form-label">Group Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. DBMS Exam Prep, ML Research Circle"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div className="col-12">
                        <label className="cc-form-label">Description *</label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows="4"
                          className="cc-form-input"
                          placeholder="What will this group focus on? Mention study schedules, topics, or goals..."
                          required
                        />
                      </div>

                      {/* Type */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Group Type *</label>
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          <option value="study">Study Circle (Exam/Subject Prep)</option>
                          <option value="project">Project Team (Hackathon/Assignment)</option>
                          <option value="forum">Open Forum (Discussion/Topic)</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Membership Status *</label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          <option value="active">Active (Actively study/connect)</option>
                          <option value="recruiting">Recruiting (Looking for members)</option>
                          <option value="open">Open (Anyone can join)</option>
                        </select>
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="cc-btn-fill py-3 px-5" style={{ border: 'none' }} disabled={loading}>
                          {loading ? 'Creating Group…' : 'Create Group'}
                        </button>
                      </div>
                    </div>
                  </form>
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
