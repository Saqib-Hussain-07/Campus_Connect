import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

export default function PostNotice() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');

  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'general',
    tags: '',
    expiresAt: ''
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
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to post notice');

      navigate('/notices');
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
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>Notice Board</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', marginBottom: '28px' }}>Post New Notice</h3>

                  {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Title */}
                      <div className="col-12">
                        <label className="cc-form-label">Notice Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. Vacancy: Software Development Intern at TechCorp"
                          required
                        />
                      </div>

                      {/* Body */}
                      <div className="col-12">
                        <label className="cc-form-label">Description / Notice Body *</label>
                        <textarea
                          name="body"
                          value={form.body}
                          onChange={handleChange}
                          rows="5"
                          className="cc-form-input"
                          placeholder="Write the full details here..."
                          required
                        />
                      </div>

                      {/* Category */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Category *</label>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          <option value="general">General Notice</option>
                          <option value="opportunity">Campus Vacancy / Opportunity</option>
                          <option value="academic">Academic Circular</option>
                          <option value="internship">Internship Alert</option>
                          <option value="placement">Placement Circular</option>
                          <option value="urgent">Urgent Announcement</option>
                        </select>
                      </div>

                      {/* Expiry Date */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Expiry Date</label>
                        <input
                          type="datetime-local"
                          name="expiresAt"
                          value={form.expiresAt}
                          onChange={handleChange}
                          className="cc-form-input"
                        />
                      </div>

                      {/* Tags */}
                      <div className="col-12">
                        <label className="cc-form-label">Tags (comma-separated)</label>
                        <input
                          type="text"
                          name="tags"
                          value={form.tags}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. tech, paid, resume, finalyear"
                        />
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="cc-btn-fill py-3 px-5" style={{ border: 'none' }} disabled={loading}>
                          {loading ? 'Posting Notice…' : 'Publish Announcement'}
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
