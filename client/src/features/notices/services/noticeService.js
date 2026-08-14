import { apiClient } from '../../../services/apiClient';

export const noticeService = {
  getNotices: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/notices${query ? `?${query}` : ''}`);
  },

  createNotice: async (noticeData) => {
    return apiClient('/api/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData)
    });
  },

  togglePin: async (noticeId) => {
    return apiClient(`/api/notices/${noticeId}/pin`, {
      method: 'PUT'
    });
  }
};
