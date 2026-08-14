import { useState, useEffect, useCallback } from 'react';
import { noticeService } from '../services/noticeService';

export function useNotices() {
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user') || 'null');

  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noticeService.getNotices();
      if (Array.isArray(data)) {
        setNotices(data);
      } else {
        setNotices([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notices');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handlePinToggle = async (noticeId) => {
    if (!token) return;
    try {
      await noticeService.togglePin(noticeId);
      fetchNotices();
    } catch (err) {
      console.error('Pin toggle failed:', err);
    }
  };

  const handleSearchClear = () => {
    setSearch('');
  };

  return {
    notices,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    fetchNotices,
    handlePinToggle,
    handleSearchClear,
    loggedInUser,
    token
  };
}
