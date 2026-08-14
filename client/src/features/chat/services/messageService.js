import { apiClient } from '../../../services/apiClient';

export const messageService = {
  getConversations: async () => {
    return apiClient('/api/messages/conversations');
  },

  getThread: async (withId, page = 1) => {
    return apiClient(`/api/messages/thread/${withId}?page=${page}`);
  },

  sendMessage: async (toUser, body, extra = {}) => {
    return apiClient('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ toUser, body, ...extra })
    });
  }
};
