import { create } from 'zustand';

/**
 * UI-only timeline state for scrubbing preview.
 * Never touches reducers or runtime state directly.
 */
export const useTimelineStore = create(() => ({
    currentTime: 0,
    duration: 5000,
    isScrubbing: false,

    setTime(t) {
        this.currentTime = Math.max(0, t);
    },

    startScrub() {
        this.isScrubbing = true;
    },

    endScrub() {
        this.isScrubbing = false;
    },
}));
