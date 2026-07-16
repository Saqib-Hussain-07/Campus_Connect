import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact" className="cc-footer pt-5 pb-4">
      <div className="container">
        <div className="row g-5 mb-5">
          {/* Brand */}
          <div className="col-lg-4 col-md-6">
            <div className="cc-brand d-flex align-items-center gap-2 mb-3">
              <div className="cc-brand-mark">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--paper)', letterSpacing: '.04em' }}>
                Campus<span className="cc-brand-accent">Connect</span>
              </span>
            </div>
            <p className="cc-footer-about">
              The secure student connection portal built to help university peers discover, collaborate, and grow together — verified, safe, and free.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a href="#" className="cc-social-btn" aria-label="X"><i className="fab fa-x-twitter"></i></a>
              <a href="#" className="cc-social-btn" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" className="cc-social-btn" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" className="cc-social-btn" aria-label="GitHub"><i className="fab fa-github"></i></a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-lg-2 col-md-3 col-6">
            <div className="cc-footer-col-title">Quick Links</div>
            <ul className="list-unstyled cc-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/students">Students</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/groups">Groups</Link></li>
              <li><Link to="/events">Events</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-3 col-6">
            <div className="cc-footer-col-title">Support</div>
            <ul className="list-unstyled cc-footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Report Abuse</a></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4 col-md-6">
            <div className="cc-footer-col-title">Get In Touch</div>
            <div className="cc-contact-item"><i className="fas fa-envelope"></i><span>hello@campusconnect.edu</span></div>
            <div className="cc-contact-item"><i className="fas fa-phone"></i><span>+91 98765 43210</span></div>
            <div className="cc-contact-item"><i className="fas fa-location-dot"></i><span>Mumbai, India</span></div>
          </div>
        </div>

        <div className="cc-footer-bottom d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 pt-4">
          <p className="cc-footer-copy mb-0">© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
          <div className="d-flex gap-4">
            <a href="#" className="cc-footer-legal-link">Privacy</a>
            <a href="#" className="cc-footer-legal-link">Terms</a>
            <a href="#" className="cc-footer-legal-link">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
