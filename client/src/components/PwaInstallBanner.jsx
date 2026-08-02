import React, { useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const { isInstallable, isInstalled, isOnline, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  const handleInstallClick = async () => {
    await promptInstall();
  };

  return (
    <>
      {/* Offline Status Warning Toast */}
      {!isOnline && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x z-3 shadow-sm px-3 py-1.5 text-white d-flex align-items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, var(--rust), #e8694a)',
            borderRadius: '0 0 10px 10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            boxShadow: '0 4px 12px rgba(201, 79, 44, 0.4)'
          }}
        >
          <i className="fa-solid fa-wifi-slash"></i>
          <span>You are offline. Running on cached CampusConnect data.</span>
        </div>
      )}

      {/* PWA Install Banner - Sleek, Compact & Website-Aligned */}
      {isInstallable && !isInstalled && !dismissed && (
        <div
          className="position-fixed bottom-0 end-0 m-2 m-md-3 p-3 shadow-lg z-3 text-white"
          style={{
            maxWidth: '310px',
            background: 'rgba(13, 13, 13, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(201, 79, 44, 0.35)',
            borderRadius: '14px',
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 4px 12px rgba(201, 79, 44, 0.25)'
          }}
        >
          <div className="d-flex align-items-start gap-2.5">
            <div
              className="cc-brand-mark"
              style={{
                width: '36px',
                height: '36px',
                flexShrink: 0
              }}
            >
              <i className="fas fa-graduation-cap" style={{ fontSize: '14px' }}></i>
            </div>
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center gap-1.5 overflow-hidden">
                  <span className="fw-bold text-truncate" style={{ color: 'var(--paper)', fontSize: '0.88rem' }}>
                    CampusConnect
                  </span>
                  <span
                    style={{
                      fontSize: '0.6rem',
                      background: 'rgba(201, 79, 44, 0.25)',
                      color: 'var(--rust-light)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600
                    }}
                  >
                    v1.0.0
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white p-1 ms-1 opacity-75"
                  style={{ fontSize: '0.65rem' }}
                  onClick={() => setDismissed(true)}
                  aria-label="Close install prompt"
                ></button>
              </div>
              <p className="mb-2" style={{ fontSize: '0.76rem', color: 'rgba(245, 240, 232, 0.75)', lineHeight: 1.35 }}>
                Add app for fast offline access & native experience.
              </p>
              <div className="d-flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="btn btn-sm px-2.5 py-1 fw-semibold rounded-2 d-flex align-items-center gap-1.5"
                  style={{
                    background: 'var(--rust)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(201, 79, 44, 0.4)'
                  }}
                >
                  <i className="fa-solid fa-download" style={{ fontSize: '0.72rem' }}></i>
                  Install App
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="btn btn-sm px-2 py-1 rounded-2"
                  style={{
                    fontSize: '0.76rem',
                    color: 'rgba(245, 240, 232, 0.8)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(245, 240, 232, 0.15)'
                  }}
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
