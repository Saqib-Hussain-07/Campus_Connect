import React, { useEffect, useState } from 'react';

export default function Loader({ message = 'Loading CampusConnect...' }) {
  const words = ['CONNECT.', 'COLLABORATE.', 'GROW.'];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cc-loader-container">
      <style>{`
        .cc-loader-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--paper, #f5f0e8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: var(--font-body, sans-serif);
        }
        .cc-loader-card {
          width: 380px;
          background: var(--white, #fafaf8);
          border: 3px solid var(--ink, #0d0d0d);
          box-shadow: 8px 8px 0 var(--ink, #0d0d0d);
          padding: 40px;
          text-align: center;
          transform: translateY(-20px);
        }
        .cc-loader-shapes {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          width: 70px;
          height: 70px;
          margin: 0 auto 30px;
          animation: cc-spin 3s infinite cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cc-loader-shape {
          width: 30px;
          height: 30px;
          border: 2px solid var(--ink, #0d0d0d);
        }
        .shape-rust { background: var(--rust, #c94f2c); }
        .shape-moss { background: var(--moss, #2d4a3e); }
        .shape-sky { background: var(--sky, #1a3a5c); }
        .shape-gold { background: var(--gold, #c9a84c); }
        
        .cc-loader-word {
          font-family: var(--font-display, sans-serif);
          font-size: 2.8rem;
          color: var(--ink, #0d0d0d);
          margin: 10px 0 20px;
          letter-spacing: 0.08em;
          min-height: 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
        }
        .cc-loader-progress-track {
          width: 100%;
          height: 14px;
          background: var(--cream, #ede8d8);
          border: 2.5px solid var(--ink, #0d0d0d);
          margin-bottom: 25px;
          position: relative;
          overflow: hidden;
        }
        .cc-loader-progress-bar {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 40%;
          background: var(--rust, #c94f2c);
          border-right: 2.5px solid var(--ink, #0d0d0d);
          animation: cc-bar-slide 1.5s infinite ease-in-out;
        }
        .cc-loader-status {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .cc-loader-status-dot {
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          animation: cc-blink 1s infinite alternate;
          border: 1.5px solid var(--ink, #0d0d0d);
        }
        @keyframes cc-spin {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(90deg); }
          50% { transform: rotate(180deg); }
          75% { transform: rotate(270deg); }
        }
        @keyframes cc-bar-slide {
          0% { left: -45%; }
          50% { left: 105%; }
          100% { left: -45%; }
        }
        @keyframes cc-blink {
          0% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
      <div className="cc-loader-card">
        {/* Shifting Graphic */}
        <div className="cc-loader-shapes">
          <div className="cc-loader-shape shape-rust"></div>
          <div className="cc-loader-shape shape-moss"></div>
          <div className="cc-loader-shape shape-sky"></div>
          <div className="cc-loader-shape shape-gold"></div>
        </div>

        {/* Big Text */}
        <h2 className="cc-loader-word">
          {words[wordIndex]}
        </h2>

        {/* Neo-brutalist Progress Track */}
        <div className="cc-loader-progress-track">
          <div className="cc-loader-progress-bar"></div>
        </div>

        {/* Status Prompt */}
        <div className="cc-loader-status">
          <span className="cc-loader-status-dot"></span>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
