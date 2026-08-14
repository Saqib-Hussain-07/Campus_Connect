import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../services/groupService';

export function useGroups() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user') || 'null');

  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async (overrideParams = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const activeSearch = overrideParams && 'search' in overrideParams ? overrideParams.search : search;
      const activeType = overrideParams && 'type' in overrideParams ? overrideParams.type : type;

      if (activeSearch) params.search = activeSearch;
      if (activeType) params.type = activeType;

      const data = await groupService.getGroups(params);
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        setGroups([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [search, type]);

  useEffect(() => {
    fetchGroups();
  }, [type]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchGroups();
  };

  const handleReset = () => {
    setSearch('');
    setType('');
    fetchGroups({ search: '', type: '' });
  };

  const handleJoinGroup = async (groupId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await groupService.joinGroup(groupId);
      fetchGroups();
    } catch (err) {
      console.error('Join group failed:', err);
    }
  };

  return {
    groups,
    loading,
    error,
    search,
    setSearch,
    type,
    setType,
    fetchGroups,
    handleSearchSubmit,
    handleReset,
    handleJoinGroup,
    loggedInUser,
    token
  };
}
