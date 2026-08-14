import { apiClient } from '../../../services/apiClient';

export const resourceService = {
  getResources: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/resources${query ? `?${query}` : ''}`);
  },

  createResource: async (resourceData) => {
    return apiClient('/api/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
  },

  likeResource: async (resourceId) => {
    return apiClient(`/api/resources/${resourceId}/like`, {
      method: 'POST'
    });
  }
};
