import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { dashboardService } from '../services/dashboardService';

export function useDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const resData = await dashboardService.getDashboardData();
      setData(resData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, [token, navigate, fetchDashboard]);

  const handleConnectionResponse = async (connId, action) => {
    try {
      await dashboardService.respondConnection(connId, action);
      const refreshData = await dashboardService.getDashboardData();
      setData(refreshData);
    } catch (err) {
      console.error('Connection response error:', err);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await dashboardService.connectUser(userId);
      const refreshData = await dashboardService.getDashboardData();
      setData(refreshData);
    } catch (err) {
      console.error('Connect error:', err);
    }
  };

  return {
    user,
    token,
    data,
    loading,
    error,
    fetchDashboard,
    handleConnectionResponse,
    handleConnect
  };
}
