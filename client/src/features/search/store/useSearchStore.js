import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  recentSearches: [],
  activeFilterTab: 'all',

  addRecentSearch: (query) => {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    set((state) => ({
      recentSearches: [clean, ...state.recentSearches.filter((s) => s !== clean)].slice(0, 10)
    }));
  },

  clearRecentSearches: () => set({ recentSearches: [] }),

  setActiveFilterTab: (tab) => set({ activeFilterTab: tab })
}));
