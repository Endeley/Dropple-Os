import { create } from 'zustand';

// Minimal selection store placeholder.
export const useSelectionStore = create((set) => ({
    selectedIds: [],
    setSelectedIds(ids = []) {
        set({ selectedIds: Array.from(ids) });
    },
    clearSelection() {
        set({ selectedIds: [] });
    },
}));
