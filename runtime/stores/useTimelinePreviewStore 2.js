import { create } from 'zustand';

/**
 * UI-only preview store for timeline scrubbing.
 * Never writes back to runtime state.
 */
export const useTimelinePreviewStore = create((set) => ({
    active: false,
    time: 0,
    nodes: {},

    setPreview(time, nodes) {
        set(
            {
                active: true,
                time,
                nodes,
            },
            false
        );
    },

    clearPreview() {
        set(
            {
                active: false,
                nodes: {},
            },
            false
        );
    },
}));
