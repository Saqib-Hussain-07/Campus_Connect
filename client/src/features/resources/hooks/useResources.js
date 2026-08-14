import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../services/resourceService';

export function useResources() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user') || 'null');

  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = useCallback(async (overrideParams = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const activeSearch = overrideParams && 'search' in overrideParams ? overrideParams.search : search;
      const activeDept = overrideParams && 'department' in overrideParams ? overrideParams.department : department;
      const activeSem = overrideParams && 'semester' in overrideParams ? overrideParams.semester : semester;
      const activeType = overrideParams && 'type' in overrideParams ? overrideParams.type : type;

      if (activeSearch) params.search = activeSearch;
      if (activeDept) params.department = activeDept;
      if (activeSem) params.semester = activeSem;
      if (activeType) params.type = activeType;

      const data = await resourceService.getResources(params);
      if (Array.isArray(data)) {
        setResources(data);
      } else {
        setResources([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [search, department, semester, type]);

  useEffect(() => {
    fetchResources();
  }, [department, semester, type]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchResources();
  };

  const handleReset = () => {
    setSearch('');
    setDepartment('');
    setSemester('');
    setType('');
    fetchResources({ search: '', department: '', semester: '', type: '' });
  };

  const handleLike = async (resourceId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await resourceService.likeResource(resourceId);
      fetchResources();
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return {
    resources,
    loading,
    error,
    search,
    setSearch,
    department,
    setDepartment,
    semester,
    setSemester,
    type,
    setType,
    fetchResources,
    handleSearchSubmit,
    handleReset,
    handleLike,
    loggedInUser,
    token
  };
}
