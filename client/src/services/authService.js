import { apiClient } from './apiClient';

export const authService = {
  login: async (email, password) => {
    return apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (userData) => {
    return apiClient('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getMe: async () => {
    return apiClient('/api/auth/me');
  },

  logout: async () => {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_user');
  },

  forgotPassword: async (email) => {
    return apiClient('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiClient('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  },

  changePassword: async (oldPassword, newPassword) => {
    return apiClient('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  },

  deleteAccount: async (password) => {
    return apiClient('/api/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }
};
