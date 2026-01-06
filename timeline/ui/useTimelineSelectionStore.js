// timeline/ui/useTimelineSelectionStore.js

import { create } from 'zustand';

/**
 * Timeline UI selection store (multi-select).
 *
 * 🔒 Rules:
 * - UI-only
 * - NOT persisted
 * - NOT replayed
 */
export const useTimelineSelectionStore = create((set, get) => ({
    selectedKeyframeIds: new Set(),

    selectSingle(keyframeId) {
        set({
            selectedKeyframeIds: new Set([keyframeId]),
        });
    },

    toggleKeyframe(keyframeId) {
        const next = new Set(get().selectedKeyframeIds);
        if (next.has(keyframeId)) {
            next.delete(keyframeId);
        } else {
            next.add(keyframeId);
        }
        set({ selectedKeyframeIds: next });
    },

    clearSelection() {
        set({ selectedKeyframeIds: new Set() });
    },

    isSelected(keyframeId) {
        return get().selectedKeyframeIds.has(keyframeId);
    },
}));
