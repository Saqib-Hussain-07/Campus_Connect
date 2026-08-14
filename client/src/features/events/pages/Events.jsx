import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';

import Footer from '../../../components/Footer';

export default function Events() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user'));

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (search) query.append('search', search);

    fetch(`/api/content/events?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [category]); // reload on category switch

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setLoading(true);
    fetch(`/api/content/events`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleRsvp = async (eventId, status) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`/api/content/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch (err) {}
  };

  const bannerImages = {
    ev1: 'https://picsum.photos/seed/event1/600/300',
    ev2: 'https://picsum.photos/seed/event2/600/300',
    ev3: 'https://picsum.photos/seed/event3/600/300',
    ev4: 'https://picsum.photos/seed/event4/600/300',
    ev5: 'https://picsum.photos/seed/event5/600/300',
    ev6: 'https://picsum.photos/seed/event6/600/300'
  };

  const catNames = {
    hackathon: 'Hackathon',
    seminar: 'Seminar / Talk',
    workshop: 'Workshop',
    other: 'Other Activity'
  };

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '0px', background: 'var(--paper)', minHeight: 'calc(100vh - 92px)' }}>
        <div className="row g-0">
          

          <div className="col-12 cc-dash-content">
            <div className={token ? "" : "container py-4"}>
              
              {/* Header */}
              <div style={{ background: 'var(--ink)', padding: '24px 40px', color: '#fff', marginBottom: '30px' }}>
                <div className="cc-section-label white-lbl">Explore</div>
                <h1 className="cc-heading on-dark">EVENTS &amp; <em>Hackathons</em></h1>
                <p style={{ color: 'rgba(255,255,255,.4)', margin: '10px 0 0', fontSize: '.9rem' }}>
                  Discover upcoming programming contests, seminars, workshops, and study circles.
                </p>
              </div>

              {/* Filters Panel */}
              <div style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: '24px', marginBottom: '24px' }}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="row g-3">
                    <div className="col-md-5">
                      <label className="cc-form-label">Search Event Name / Details</label>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="cc-form-input"
                        placeholder="e.g. Hackathon, Flutter, Coding"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="cc-form-label">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="cc-form-input"
                      >
                        <option value="">— All Categories —</option>
                        <option value="hackathon">Hackathon / Contest</option>
                        <option value="seminar">Guest Seminar</option>
                        <option value="workshop">Hands-on Workshop</option>
                        <option value="other">General Meetup</option>
                      </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-end gap-2">
                      <button type="submit" className="cc-btn-fill py-2 flex-grow-1" style={{ border: 'none', height: '42px', fontSize: '.78rem' }}>
                        Filter
                      </button>
                      <button type="button" onClick={handleReset} className="cc-btn-outline py-2 px-3" style={{ height: '42px', fontSize: '.78rem' }}>
                        Reset
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="d-flex justify-content-end mb-4">
                <Link to={token ? "/create-event" : "/login"} state={token ? null : { message: 'Please log in to host campus events and hackathons.' }} className="cc-btn-lg-dark" style={{ padding: '10px 20px', fontSize: '.76rem' }}>
                  <span>{token ? 'Host Event / Hackathon' : 'Login to Host Event'}</span><i className="fas fa-plus ms-2"></i>
                </Link>
              </div>

              {/* Events Grid */}
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                  Filtering Events directory…
                </div>
              ) : events.length > 0 ? (
                <div className="row g-4">
                  {events.map((ev) => {
                    const goingCount = ev.rsvps?.filter((r) => r.status === 'going').length || 0;
                    const intCount = ev.rsvps?.filter((r) => r.status === 'interested').length || 0;
                    const myRsvp = loggedInUser && ev.rsvps?.find((r) => r.userId === loggedInUser.id);
                    const banner = bannerImages[ev.bannerSeed] || 'https://picsum.photos/seed/event/600/300';
                    const eventDateObj = new Date(ev.eventDate);

                    return (
                      <div key={ev._id} className="col-md-6">
                        <div className="cc-feature-card d-flex flex-column justify-content-between" style={{ border: '1.5px solid var(--ink)', background: 'var(--white)', padding: 0, boxShadow: '4px 4px 0px var(--ink)', minHeight: '380px', overflow: 'hidden' }}>
                          
                          {/* Banner Image */}
                          <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                            <img src={banner} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`${ev.title} event banner`} />
                            <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '.6rem', fontFamily: 'var(--font-mono)', background: 'var(--ink)', color: '#fff', padding: '2px 8px', textTransform: 'uppercase' }}>
                              {catNames[ev.category] || ev.category}
                            </span>
                            {ev.isOnline && (
                              <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '.6rem', fontFamily: 'var(--font-mono)', background: 'var(--rust)', color: '#fff', padding: '2px 8px', textTransform: 'uppercase' }}>
                                Online
                              </span>
                            )}
                          </div>

                          {/* Content Body */}
                          <div style={{ padding: '20px' }} className="flex-grow-1">
                            <div style={{ fontSize: '.72rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                              <i className="fas fa-calendar-alt me-1" aria-hidden="true"></i>
                              {eventDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {eventDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.15rem', margin: '0 0 8px' }}>
                              {ev.title}
                            </h4>
                            <div style={{ fontSize: '.78rem', color: '#666', marginBottom: '8px' }}>
                              <i className="fas fa-map-marker-alt me-1" aria-hidden="true"></i>{ev.venue || 'TBD'}
                            </div>
                            <p style={{ fontSize: '.84rem', color: '#555', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                              {ev.description}
                            </p>
                          </div>

                          {/* Action Footer */}
                          <div style={{ borderTop: '1px solid var(--cream)', padding: '16px 20px', background: 'var(--paper)' }} className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <span style={{ fontSize: '.68rem', fontFamily: 'var(--font-mono)', color: '#777' }}>
                                👍 {goingCount} going · {intCount} interested
                              </span>
                              {myRsvp && (
                                <span style={{ fontSize: '.58rem', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: myRsvp.status === 'going' ? 'var(--moss)' : 'var(--gold)', color: '#fff', textTransform: 'uppercase' }}>
                                  RSVP: {myRsvp.status}
                                </span>
                              )}
                            </div>

                            <div className="d-flex gap-1">
                              <button
                                onClick={() => handleRsvp(ev._id, 'going')}
                                className="btn btn-sm"
                                style={{
                                  fontSize: '.7rem',
                                  background: myRsvp?.status === 'going' ? 'var(--moss)' : 'transparent',
                                  border: '1px solid var(--ink)',
                                  color: myRsvp?.status === 'going' ? '#fff' : 'var(--ink)',
                                  borderRadius: 0
                                }}
                              >
                                Going
                              </button>
                              <button
                                onClick={() => handleRsvp(ev._id, 'interested')}
                                className="btn btn-sm"
                                style={{
                                  fontSize: '.7rem',
                                  background: myRsvp?.status === 'interested' ? 'var(--gold)' : 'transparent',
                                  border: '1px solid var(--ink)',
                                  color: myRsvp?.status === 'interested' ? '#fff' : 'var(--ink)',
                                  borderRadius: 0
                                }}
                              >
                                Interested
                              </button>
                              {myRsvp && (
                                <button
                                  onClick={() => handleRsvp(ev._id, 'not_going')}
                                  className="btn btn-sm btn-outline-secondary"
                                  style={{ fontSize: '.7rem', borderRadius: 0 }}
                                >
                                  Leave
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5" style={{ color: '#aaa', border: '1.5px dashed var(--cream)', background: '#fff' }}>
                  <i className="fas fa-calendar-times fa-2x mb-3"></i>
                  <p>No events found matching the filters.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
