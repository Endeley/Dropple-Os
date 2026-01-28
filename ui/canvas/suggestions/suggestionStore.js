import { create } from 'zustand';

export const useSuggestionStore = create((set) => ({
    suggestions: [],
    setSuggestions(next = []) {
        set({ suggestions: Array.isArray(next) ? next : [] });
    },
}));
