import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  activePartnerId: null,
  drafts: {},
  searchFilter: '',

  setActivePartner: (partnerId) => set({ activePartnerId: partnerId }),

  setDraft: (partnerId, text) =>
    set((state) => ({
      drafts: { ...state.drafts, [partnerId]: text }
    })),

  getDraft: (partnerId) => get().drafts[partnerId] || '',

  clearDraft: (partnerId) =>
    set((state) => {
      const nextDrafts = { ...state.drafts };
      delete nextDrafts[partnerId];
      return { drafts: nextDrafts };
    }),

  setSearchFilter: (term) => set({ searchFilter: term })
}));
