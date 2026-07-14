import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function AddProject() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');

  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    category: 'web',
    status: 'in_progress',
    teamSize: '1'
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
      const res = await fetch('/api/content/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to post project');

      navigate('/dashboard');
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
          <Sidebar />

          <div className="col-xl-10 col-lg-9 cc-dash-content">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '36px', boxShadow: '4px 4px 0px var(--ink)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>Project Hub</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', marginBottom: '28px' }}>Post New Project</h3>

                  {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Title */}
                      <div className="col-12">
                        <label className="cc-form-label">Project Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. SmartCampus AI Assistant"
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
                          placeholder="Explain what your project does, the problem it solves, and how to run it..."
                          required
                        />
                      </div>

                      {/* Tech Stack */}
                      <div className="col-12">
                        <label className="cc-form-label">Tech Stack (comma-separated) *</label>
                        <input
                          type="text"
                          name="techStack"
                          value={form.techStack}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. React, Node.js, Express, MongoDB, Python"
                          required
                        />
                      </div>

                      {/* GitHub Link */}
                      <div className="col-md-6">
                        <label className="cc-form-label">GitHub Repository URL</label>
                        <input
                          type="url"
                          name="githubUrl"
                          value={form.githubUrl}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="https://github.com/yourusername/repo"
                        />
                      </div>

                      {/* Live Demo Link */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Live Demo / Deployment URL</label>
                        <input
                          type="url"
                          name="liveUrl"
                          value={form.liveUrl}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="https://yourproject.vercel.app"
                        />
                      </div>

                      {/* Category */}
                      <div className="col-md-4">
                        <label className="cc-form-label">Category *</label>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          <option value="web">Web Application</option>
                          <option value="mobile">Mobile Application</option>
                          <option value="ml">Machine Learning / AI</option>
                          <option value="hardware">Hardware / Robotics</option>
                          <option value="research">Research Paper</option>
                          <option value="other">Other Projects</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="col-md-4">
                        <label className="cc-form-label">Project Status *</label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="looking_for_team">Looking for Team</option>
                        </select>
                      </div>

                      {/* Team size */}
                      <div className="col-md-4">
                        <label className="cc-form-label">Target Team Size *</label>
                        <input
                          type="number"
                          name="teamSize"
                          value={form.teamSize}
                          onChange={handleChange}
                          className="cc-form-input"
                          min="1"
                          required
                        />
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="cc-btn-fill py-3 px-5" style={{ border: 'none' }} disabled={loading}>
                          {loading ? 'Posting Project…' : 'Publish Project Showcase'}
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
