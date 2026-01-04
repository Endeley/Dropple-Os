import { create } from 'zustand';

/**
 * UI-only timeline preview state.
 * Never feeds reducers; preview-only.
 */
export const useTimelinePreviewStore = create(() => ({
    time: 0,
    isScrubbing: false,

    setTime(time) {
        this.time = time;
    },

    startScrub() {
        this.isScrubbing = true;
    },

    endScrub() {
        this.isScrubbing = false;
    },
}));
