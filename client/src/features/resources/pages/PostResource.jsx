import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../../components/Navbar';

import Footer from '../../../components/Footer';

export default function PostResource() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('campusconnect_token');

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: location, message: 'Please log in to share study materials or academic resources.' } });
    }
  }, [token, navigate, location]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'notes',
    url: '',
    department: 'Computer Science Engineering',
    semester: '1'
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
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to share resource');

      navigate('/resources');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  const departments = [
    'Computer Science Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Electronics',
    'Chemical Engineering',
    'Data Science',
    'Business Administration',
    'UX & Design',
    'MCA (Postgraduate)'
  ];

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '36px', boxShadow: '4px 4px 0px var(--ink)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>Study Repository</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', marginBottom: '28px' }}>Share Study Resource</h3>

                  {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Title */}
                      <div className="col-12">
                        <label className="cc-form-label">Resource Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. Complete DBMS Notes — B.Tech Pattern"
                          required
                        />
                      </div>

                      {/* Subject */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Subject / Course Name *</label>
                        <input
                          type="text"
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. Database Management Systems"
                          required
                        />
                      </div>

                      {/* Resource Type */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Resource Type *</label>
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          <option value="notes">Lecture Notes (PDF / Doc)</option>
                          <option value="video">Tutorial / Video Playlist</option>
                          <option value="book">Reference Textbook (PDF)</option>
                          <option value="article">Technical Article / Guide</option>
                          <option value="tool">Interactive Tool / Repository</option>
                          <option value="other">Other Reference Link</option>
                        </select>
                      </div>

                      {/* Shared URL */}
                      <div className="col-12">
                        <label className="cc-form-label">Resource URL (Google Drive / GitHub / YouTube Link) *</label>
                        <input
                          type="url"
                          name="url"
                          value={form.url}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="https://drive.google.com/..."
                          required
                        />
                      </div>

                      {/* Department */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Target Department *</label>
                        <select
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Semester */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Target Semester *</label>
                        <select
                          name="semester"
                          value={form.semester}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                            <option key={sem} value={sem}>
                              Semester {sem}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Description */}
                      <div className="col-12">
                        <label className="cc-form-label">Resource Description *</label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows="3"
                          className="cc-form-input"
                          placeholder="Explain what topics this covers, how it helps, or context..."
                          required
                        />
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="cc-btn-fill py-3 px-5" style={{ border: 'none' }} disabled={loading}>
                          {loading ? 'Sharing Resource…' : 'Share Resource Link'}
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
