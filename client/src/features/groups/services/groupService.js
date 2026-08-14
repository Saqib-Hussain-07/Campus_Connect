import { apiClient } from '../../../services/apiClient';

export const groupService = {
  getGroups: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/content/groups${query ? `?${query}` : ''}`);
  },

  createGroup: async (groupData) => {
    return apiClient('/api/content/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  },

  joinGroup: async (groupId) => {
    return apiClient(`/api/content/groups/${groupId}/join`, {
      method: 'POST'
    });
  }
};
