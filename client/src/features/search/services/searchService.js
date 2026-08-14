import { apiClient } from '../../../services/apiClient';

export const searchService = {
  search: async (query) => {
    return apiClient(`/api/general/search?q=${encodeURIComponent(query)}`);
  }
};
