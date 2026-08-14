import { apiClient } from '../../../services/apiClient';

export const studentService = {
  getStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/users${query ? `?${query}` : ''}`);
  },

  getStudentById: async (id) => {
    return apiClient(`/api/users/${id}`);
  },

  getConnectionStatus: async (id) => {
    return apiClient(`/api/users/connections/status/${id}`);
  },

  connectStudent: async (id) => {
    return apiClient(`/api/users/${id}/connect`, {
      method: 'POST'
    });
  },

  endorseSkill: async (id, skill) => {
    return apiClient(`/api/users/${id}/endorse`, {
      method: 'POST',
      body: JSON.stringify({ skill })
    });
  },

  respondConnection: async (connId, action) => {
    return apiClient(`/api/users/connections/${connId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }
};
