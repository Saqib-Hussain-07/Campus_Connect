import { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '../services/leaderboardService';

export function useLeaderboard() {
  const [activeTab, setActiveTab] = useState('connections');
  const [data, setData] = useState({ connections: [], builders: [], endorsed: [], groupers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await leaderboardService.getLeaderboard();
      setData(json || { connections: [], builders: [], endorsed: [], groupers: [] });
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getActiveList = () => {
    return data[activeTab] || [];
  };

  const getScoreLabel = (item) => {
    if (activeTab === 'connections') {
      return `${item.conn_count} connection${item.conn_count !== 1 ? 's' : ''}`;
    }
    if (activeTab === 'builders') {
      return `${item.total_likes} like${item.total_likes !== 1 ? 's' : ''} on ${item.project_count} project${item.project_count !== 1 ? 's' : ''}`;
    }
    if (activeTab === 'endorsed') {
      return `${item.endorse_count} endorsement${item.endorse_count !== 1 ? 's' : ''}`;
    }
    if (activeTab === 'groupers') {
      return `${item.group_count} group${item.group_count !== 1 ? 's' : ''}`;
    }
    return '';
  };

  const getShortScore = (item) => {
    if (activeTab === 'connections') return `${item.conn_count} connects`;
    if (activeTab === 'builders') return `${item.total_likes} likes`;
    if (activeTab === 'endorsed') return `${item.endorse_count} endorsements`;
    if (activeTab === 'groupers') return `${item.group_count} groups`;
    return '';
  };

  const getSubLabel = (item) => {
    if (activeTab === 'connections') {
      return item.department || '';
    }
    if (activeTab === 'builders') {
      return item.department || '';
    }
    if (activeTab === 'endorsed' && item.endorsed_skills) {
      return `Skills: ${item.endorsed_skills}`;
    }
    if (activeTab === 'groupers') {
      return item.department || '';
    }
    return '';
  };

  return {
    activeTab,
    setActiveTab,
    data,
    loading,
    error,
    getActiveList,
    getScoreLabel,
    getShortScore,
    getSubLabel,
    fetchLeaderboard
  };
}
