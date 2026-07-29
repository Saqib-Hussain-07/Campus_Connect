import { apiClient } from './apiClient';

export const eventService = {
  getEvents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/content/events${query ? `?${query}` : ''}`);
  },

  createEvent: async (eventData) => {
    return apiClient('/api/content/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  rsvpEvent: async (eventId, status) => {
    return apiClient(`/api/content/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }
};
