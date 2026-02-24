import { create } from 'zustand';

/**
 * UI-only timeline preview state.
 * Never feeds reducers; preview-only.
 */
export const useTimelinePreviewStore = create(() => ({
    isScrubbing: false,

    startScrub() {
        this.isScrubbing = true;
    },

    endScrub() {
        this.isScrubbing = false;
    },
}));
