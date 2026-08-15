import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export default function BookmarkButton({
  itemType,
  itemId,
  initialBookmarked = false,
  className = '',
  style = {}
}) {
  const { addToast } = useToast();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !bookmarked;
    setBookmarked(nextState); // Optimistic UI update

    try {
      setLoading(true);
      const res = await apiClient.post('/api/bookmarks/toggle', { itemType, itemId });
      if (res.data?.success) {
        addToast(
          res.data.data?.bookmarked ? 'Saved to bookmarks!' : 'Removed from bookmarks',
          'success'
        );
      }
    } catch (err) {
      setBookmarked(!nextState); // Rollback on failure
      addToast(err.message || 'Failed to update bookmark', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`cc-bookmark-btn ${className}`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark item'}
      title={bookmarked ? 'Saved to Bookmarks' : 'Save Bookmark'}
      style={{
        background: bookmarked ? 'var(--rust, #e15b34)' : 'var(--white, #fff)',
        color: bookmarked ? '#fff' : 'var(--ink, #111)',
        border: '1.5px solid var(--ink, #111)',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '2px 2px 0 var(--ink, #111)',
        transition: 'transform 0.1s ease, background 0.15s ease',
        ...style
      }}
    >
      <i className={`${bookmarked ? 'fas' : 'far'} fa-bookmark`} style={{ fontSize: '14px' }}></i>
    </button>
  );
}
