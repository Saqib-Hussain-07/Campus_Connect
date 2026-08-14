import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../services/searchService';

export function useSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const token = localStorage.getItem('campusconnect_token');

  const [results, setResults] = useState({ students: [], projects: [], groups: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async () => {
    if (!query) {
      setResults({ students: [], projects: [], groups: [], events: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchService.search(query);
      setResults(data || { students: [], projects: [], groups: [], events: [] });
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults({ students: [], projects: [], groups: [], events: [] });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return {
    query,
    results,
    loading,
    error,
    token
  };
}
