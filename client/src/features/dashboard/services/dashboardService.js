import { apiClient } from '../../../services/apiClient';

export const dashboardService = {
  getDashboardData: async () => {
    return apiClient('/api/dashboard');
  },

  respondConnection: async (connId, action) => {
    return apiClient(`/api/users/connections/${connId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },

  connectUser: async (userId) => {
    return apiClient(`/api/users/${userId}/connect`, {
      method: 'POST'
    });
  }
};
