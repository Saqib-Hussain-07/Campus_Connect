import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function Contact() {
  const token = localStorage.getItem('campusconnect_token');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/general/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Submit failed');

      setSuccess('Message sent successfully!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (idx) => {
    if (openFaq === idx) {
      setOpenFaq(null);
    } else {
      setOpenFaq(idx);
    }
  };

  const infoCards = [
    {
      title: 'Email Us',
      value: 'hello@campusconnect.edu',
      desc: 'For general queries & feedback',
      icon: 'fas fa-envelope',
      bg: 'var(--rust)',
      valueColor: 'var(--rust)'
    },
    {
      title: 'Call Us',
      value: '+91 98765 43210',
      desc: 'Mon-Fri, 9 AM - 6 PM IST',
      icon: 'fas fa-phone-alt',
      bg: 'var(--moss)',
      valueColor: 'var(--ink)'
    },
    {
      title: 'Visit Us',
      value: 'Mumbai, India',
      desc: 'Andheri East, Mumbai 400093',
      icon: 'fas fa-map-marker-alt',
      bg: 'var(--sky)',
      valueColor: 'var(--ink)'
    },
    {
      title: 'Report Abuse',
      value: 'abuse@campusconnect.edu',
      desc: 'For safety & harassment issues',
      icon: 'fas fa-shield-alt',
      bg: 'var(--gold)',
      valueColor: 'var(--rust)'
    }
  ];

  const socials = [
    { icon: 'fab fa-twitter', link: '#' },
    { icon: 'fab fa-linkedin-in', link: '#' },
    { icon: 'fab fa-instagram', link: '#' },
    { icon: 'fab fa-github', link: '#' },
    { icon: 'fab fa-youtube', link: '#' }
  ];

  const faqs = [
    {
      question: "Is CampusConnect free?",
      answer: "Yes, CampusConnect is 100% free for all students. You can access all features, including messaging, group creations, project listings, notice boards, and study resources without any cost."
    },
    {
      question: "Who can join CampusConnect?",
      answer: "Any currently enrolled university student with a valid university email address (.edu, .edu.in, etc.) can sign up and join the campus network."
    },
    {
      question: "How do I find study partners?",
      answer: "You can visit the 'Students' page, apply filters based on skills, department, semester, or university, and send connection requests. Once connected, you can message them directly."
    },
    {
      question: "Can I post my projects?",
      answer: "Absolutely! Go to the 'Projects' page and click on 'Add Project'. You can detail your project's tech stack, description, github repository link, and invite others to request to join your project."
    },
    {
      question: "Is my data safe?",
      answer: "We prioritize user privacy and data security. Your account information is password-secured, and only verified students on the network can view student profiles and search listings."
    },
    {
      question: "How do I report someone?",
      answer: "If you encounter any spam, harassment, or inappropriate behavior, you can report it by sending an email with details directly to our abuse handle: abuse@campusconnect.edu or contacting our support team."
    }
  ];

  return (
    <div>
      <Navbar />

      <div style={{ marginTop: '92px', background: 'var(--paper)', minHeight: '100vh' }}>
        <div className="row g-0">
          <Sidebar />

          <div className={token ? "col-xl-10 col-lg-9 cc-dash-content" : "col-12 cc-dash-content"}>
            <div className={token ? "" : "container py-4"}>
              {/* Header Box */}
              <div style={{ background: 'var(--ink)', padding: '24px 40px', color: '#fff', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <span style={{ width: '20px', height: '1px', background: 'rgba(255, 255, 255, 0.4)' }}></span>
                  GET IN TOUCH
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--white)', margin: '0', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 'normal', lineHeight: '1' }}>
                  Contact <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)', color: 'var(--gold)', textTransform: 'none' }}>Us</em>
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '16px 0 0', fontSize: '0.95rem' }}>
                  Questions, feedback, or need help? We're here and happy to respond.
                </p>
              </div>

              {/* Two Column Layout */}
              <div className="row g-4">
                {/* Left Column: Contact Cards */}
                <div className="col-lg-4">
                  {infoCards.map((card, idx) => (
                    <div key={idx} style={{
                      background: 'var(--white)',
                      border: '1px solid #d3c9b9',
                      padding: '24px',
                      marginBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      textAlign: 'left'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: card.bg,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem'
                      }}>
                        <i className={card.icon}></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px', color: 'var(--ink)' }}>{card.title}</h4>
                        <div style={{ color: card.valueColor, fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px', wordBreak: 'break-all' }}>
                          {card.value}
                        </div>
                        <div style={{ color: '#777', fontSize: '0.8rem' }}>
                          {card.desc}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Social Media Links */}
                  <div style={{
                    background: 'var(--white)',
                    border: '1px solid #d3c9b9',
                    padding: '24px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Follow Us</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {socials.map((s, idx) => (
                        <a key={idx} href={s.link} target="_blank" rel="noopener noreferrer" style={{
                          width: '36px',
                          height: '36px',
                          border: '1px solid #d3c9b9',
                          color: '#777',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--ink)';
                          e.currentTarget.style.color = 'var(--ink)';
                          e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#d3c9b9';
                          e.currentTarget.style.color = '#777';
                          e.currentTarget.style.background = 'transparent';
                        }}
                        >
                          <i className={s.icon}></i>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Form & FAQ */}
                <div className="col-lg-8">
                  {/* Send a Message Form */}
                  <div style={{
                    background: 'var(--white)',
                    border: '1px solid #d3c9b9',
                    padding: '36px',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '4px' }}>Send a Message</h3>
                    <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '28px' }}>
                      We read every message and respond within 24 hours on weekdays.
                    </p>

                    {success && <div className="alert alert-success" style={{ borderRadius: '0', border: '1px solid #198754' }}>{success}</div>}
                    {error && <div className="alert alert-danger" style={{ borderRadius: '0', border: '1px solid #dc3545' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                            Your Name <span style={{ color: 'var(--rust)' }}>*</span>
                          </label>
                          <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Priya Sharma"
                            style={{
                              background: '#fafaf8',
                              border: '1px solid #d3c9b9',
                              padding: '12px 16px',
                              fontSize: '0.95rem',
                              color: 'var(--ink)',
                              width: '100%',
                              outline: 'none',
                              borderRadius: '0'
                            }} 
                            required 
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                            Email Address <span style={{ color: 'var(--rust)' }}>*</span>
                          </label>
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="you@university.edu"
                            style={{
                              background: '#fafaf8',
                              border: '1px solid #d3c9b9',
                              padding: '12px 16px',
                              fontSize: '0.95rem',
                              color: 'var(--ink)',
                              width: '100%',
                              outline: 'none',
                              borderRadius: '0'
                            }} 
                            required 
                          />
                        </div>
                        <div className="col-12">
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                            Subject <span style={{ color: 'var(--rust)' }}>*</span>
                          </label>
                          <select 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)}
                            style={{
                              background: '#fafaf8',
                              border: '1px solid #d3c9b9',
                              padding: '12px 16px',
                              fontSize: '0.95rem',
                              color: 'var(--ink)',
                              width: '100%',
                              outline: 'none',
                              borderRadius: '0',
                              cursor: 'pointer'
                            }}
                            required
                          >
                            <option value="">Choose a subject</option>
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Technical Support">Technical Support</option>
                            <option value="Partnership / Collaboration">Partnership / Collaboration</option>
                            <option value="Report an Issue / Abuse">Report an Issue / Abuse</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                            Message <span style={{ color: 'var(--rust)' }}>*</span>
                          </label>
                          <textarea 
                            rows="6" 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            placeholder="Tell us how we can help"
                            style={{
                              background: '#fafaf8',
                              border: '1px solid #d3c9b9',
                              padding: '12px 16px',
                              fontSize: '0.95rem',
                              color: 'var(--ink)',
                              width: '100%',
                              outline: 'none',
                              borderRadius: '0',
                              resize: 'none'
                            }} 
                            required
                          ></textarea>
                        </div>
                        <div className="col-12">
                          <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                              background: 'var(--rust)',
                              color: 'var(--white)',
                              border: 'none',
                              padding: '12px 24px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85rem',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rust-light)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--rust)'}
                          >
                            {loading ? 'Sending...' : 'Send Message'}
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Frequently Asked Questions */}
                  <div style={{
                    background: 'var(--white)',
                    border: '1px solid #d3c9b9',
                    padding: '36px'
                  }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '24px' }}>Frequently Asked Questions</h3>
                    <div>
                      {faqs.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                          <div 
                            onClick={() => toggleFaq(idx)}
                            style={{
                              background: 'var(--paper)',
                              padding: '16px 20px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              border: '1px solid rgba(0,0,0,0.03)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#ede8d8'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--paper)'}
                          >
                            <span style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '0.95rem' }}>{item.question}</span>
                            <i className={`fas fa-chevron-${openFaq === idx ? 'up' : 'down'}`} style={{ color: '#888', fontSize: '0.85rem' }}></i>
                          </div>
                          {openFaq === idx && (
                            <div style={{
                              background: 'var(--paper)',
                              padding: '0 20px 16px 20px',
                              color: '#555',
                              fontSize: '0.9rem',
                              lineHeight: '1.6'
                            }}>
                              {item.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
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

