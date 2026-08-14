import { apiClient } from '../../../services/apiClient';

export const leaderboardService = {
  getLeaderboard: async () => {
    return apiClient('/api/general/leaderboard');
  }
};
