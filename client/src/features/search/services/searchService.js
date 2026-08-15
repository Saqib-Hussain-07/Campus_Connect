import { apiClient } from '../../../services/apiClient';

export const searchService = {
  search: async (query, category = 'all') => {
    const res = await apiClient(
      `/api/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
    );
    return res?.results || res?.data?.results || res;
  }
};
