import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async (overrideParams = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const activeSearch = overrideParams && 'search' in overrideParams ? overrideParams.search : search;
      const activeCategory = overrideParams && 'category' in overrideParams ? overrideParams.category : category;
      const activeStatus = overrideParams && 'status' in overrideParams ? overrideParams.status : status;

      if (activeSearch) params.search = activeSearch;
      if (activeCategory) params.category = activeCategory;
      if (activeStatus) params.status = activeStatus;

      const data = await projectService.getProjects(params);
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [category, status, search]);

  useEffect(() => {
    fetchProjects();
  }, [category, status]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchProjects();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    fetchProjects({ search: '', category: '', status: '' });
  };

  return {
    projects,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    fetchProjects,
    handleSearchSubmit,
    handleReset
  };
}
