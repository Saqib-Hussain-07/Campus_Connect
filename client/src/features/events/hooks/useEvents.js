import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';

export function useEvents() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async (overrideParams = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const activeCategory = overrideParams && 'category' in overrideParams ? overrideParams.category : category;
      const activeSearch = overrideParams && 'search' in overrideParams ? overrideParams.search : search;

      if (activeCategory) params.category = activeCategory;
      if (activeSearch) params.search = activeSearch;

      const data = await eventService.getEvents(params);
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    fetchEvents();
  }, [category]); // re-fetch when category filter changes

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchEvents();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    fetchEvents({ search: '', category: '' });
  };

  const handleRsvp = async (eventId, status) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await eventService.rsvpEvent(eventId, status);
      // Refresh events list to reflect updated RSVP status
      fetchEvents();
    } catch (err) {
      console.error('RSVP failed:', err);
    }
  };

  return {
    events,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    fetchEvents,
    handleSearchSubmit,
    handleReset,
    handleRsvp
  };
}
