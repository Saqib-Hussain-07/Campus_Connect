import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function CreateEvent() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'workshop',
    venue: '',
    eventDate: '',
    registrationDeadline: '',
    maxAttendees: '0',
    isOnline: false,
    bannerSeed: 'ev1'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      const res = await fetch('/api/content/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create event');

      navigate('/events');
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
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>Events Hub</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: '.95', marginBottom: '28px' }}>Create Campus Event</h3>

                  {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Title */}
                      <div className="col-12">
                        <label className="cc-form-label">Event Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. HackFest 2025 — 36-Hour Hackathon"
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
                          placeholder="Explain what the event is about, prizes, schedule, or guidelines..."
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
                          <option value="hackathon">Hackathon</option>
                          <option value="seminar">Seminar / Guest Lecture</option>
                          <option value="workshop">Hands-on Workshop</option>
                          <option value="cultural">Cultural Event</option>
                          <option value="sports">Sports Tournament</option>
                          <option value="other">Other Event</option>
                        </select>
                      </div>

                      {/* Event Banner Seed */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Banner Image Theme *</label>
                        <select
                          name="bannerSeed"
                          value={form.bannerSeed}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        >
                          <option value="ev1">Tech / Hackathon Theme</option>
                          <option value="ev2">Robotics / Engineering Theme</option>
                          <option value="ev3">Startup / Business Theme</option>
                          <option value="ev4">Cloud / Code Theme</option>
                          <option value="ev5">UX / Design Theme</option>
                          <option value="ev6">Olympiad / Seminar Theme</option>
                        </select>
                      </div>

                      {/* Dates */}
                      <div className="col-md-6">
                        <label className="cc-form-label">Event Date & Time *</label>
                        <input
                          type="datetime-local"
                          name="eventDate"
                          value={form.eventDate}
                          onChange={handleChange}
                          className="cc-form-input"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="cc-form-label">Registration Deadline</label>
                        <input
                          type="datetime-local"
                          name="registrationDeadline"
                          value={form.registrationDeadline}
                          onChange={handleChange}
                          className="cc-form-input"
                        />
                      </div>

                      {/* Venue */}
                      <div className="col-12">
                        <label className="cc-form-label">Venue / Location *</label>
                        <input
                          type="text"
                          name="venue"
                          value={form.venue}
                          onChange={handleChange}
                          className="cc-form-input"
                          placeholder="e.g. Block C Lab / Zoom Link / J.N. Tata Auditorium"
                          required
                        />
                      </div>

                      {/* Online Status & Max Attendees */}
                      <div className="col-md-6 d-flex align-items-center">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            name="isOnline"
                            id="isOnlineCheck"
                            checked={form.isOnline}
                            onChange={handleChange}
                            className="form-check-input"
                            style={{ cursor: 'pointer' }}
                          />
                          <label className="form-check-label" htmlFor="isOnlineCheck" style={{ userSelect: 'none', cursor: 'pointer', fontSize: '.84rem', fontWeight: '600' }}>
                            This is an Online Event (e.g. Zoom/Discord)
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="cc-form-label">Max Attendees (0 for unlimited)</label>
                        <input
                          type="number"
                          name="maxAttendees"
                          value={form.maxAttendees}
                          onChange={handleChange}
                          className="cc-form-input"
                          min="0"
                          required
                        />
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="cc-btn-fill py-3 px-5" style={{ border: 'none' }} disabled={loading}>
                          {loading ? 'Publishing Event…' : 'Publish Campus Event'}
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
