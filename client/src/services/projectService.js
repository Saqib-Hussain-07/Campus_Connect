import { apiClient } from './apiClient';

export const projectService = {
  getProjects: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/content/projects${query ? `?${query}` : ''}`);
  },

  getProjectById: async (id) => {
    return apiClient(`/api/content/projects/${id}`);
  },

  createProject: async (projectData) => {
    return apiClient('/api/content/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  likeProject: async (id) => {
    return apiClient(`/api/content/projects/${id}/like`, {
      method: 'POST'
    });
  },

  commentProject: async (id, body) => {
    return apiClient(`/api/content/projects/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ body })
    });
  },

  submitJoinRequest: async (id, message) => {
    return apiClient(`/api/content/projects/${id}/request`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }
};
