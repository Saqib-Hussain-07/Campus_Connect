import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle = 'Item'
}) {
  const { addToast } = useToast();
  const [reason, setReason] = useState('inappropriate_content');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiClient.post('/api/reports', {
        targetType,
        targetId,
        reason,
        details
      });

      if (res.data?.success) {
        addToast('Report submitted. Our moderation team will review this.', 'success');
        onClose();
      } else {
        addToast(res.data?.error?.message || 'Failed to submit report', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error submitting report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop-custom"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1060,
        padding: '16px'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div
        style={{
          background: 'var(--paper, #f5f0e8)',
          border: '2px solid var(--ink, #111)',
          boxShadow: '6px 6px 0 var(--ink, #111)',
          maxWidth: '480px',
          width: '100%',
          padding: '24px',
          position: 'relative'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 id="report-modal-title" style={{ fontFamily: 'var(--font-display)', margin: 0, color: 'var(--ink)' }}>
            <i className="fas fa-flag text-rust me-2"></i>Report Content
          </h5>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <p style={{ fontSize: '.84rem', color: '#4b5563', marginBottom: '16px' }}>
          Help keep CampusConnect safe. Reporting <strong>{targetTitle}</strong>:
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={{ fontSize: '.75rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Reason for reporting:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="cc-form-input w-100"
              style={{ padding: '8px 12px' }}
              required
            >
              <option value="inappropriate_content">Inappropriate / Offensive Content</option>
              <option value="spam">Spam / Advertising</option>
              <option value="harassment">Harassment or Hate Speech</option>
              <option value="scam">Scam / Fraudulent Listing</option>
              <option value="copyright">Copyright Infringement</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div className="mb-4">
            <label style={{ fontSize: '.75rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Additional Details (optional):
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Provide context for our moderators..."
              className="cc-form-input w-100"
              style={{ resize: 'vertical' }}
              maxLength={1000}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cc-btn"
              style={{ padding: '8px 16px', background: '#e2e8f0', border: '1px solid #cbd5e1' }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cc-btn-fill"
              style={{ padding: '8px 20px', background: 'var(--rust)', color: '#fff', border: 'none' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
