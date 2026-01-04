import { create } from 'zustand';

/**
 * Timeline preview overlay.
 * NEVER commits to runtime.
 */
export const useTimelinePreviewStore = create(() => ({
    previewState: null,

    set(previewState) {
        this.previewState = previewState;
    },

    clear() {
        this.previewState = null;
    },
}));
