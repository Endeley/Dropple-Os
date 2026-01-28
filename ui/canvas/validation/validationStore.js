import { create } from 'zustand';

export const useValidationStore = create((set) => ({
    issues: [],
    setIssues(next = []) {
        set({ issues: Array.isArray(next) ? next : [] });
    },
}));
