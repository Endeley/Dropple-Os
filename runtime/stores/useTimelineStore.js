import { create } from 'zustand';
import { dedupeAndSortTimes } from '@/runtime/timeline/keyframeTimeUtils.js';

/**
 * UI-only timeline state for scrubbing preview.
 * Never touches reducers or runtime state directly.
 */
export const useTimelineStore = create((set, get) => ({
    duration: 5000,
    isScrubbing: false,
    fps: 24,
    keyframeTimes: [],
    snapToKeyframes: false,
    previewInterpolation: 'interpolate',
    isPlaying: false,

    startScrub() {
        set({ isScrubbing: true });
    },

    endScrub() {
        set({ isScrubbing: false });
    },

    setDuration(duration) {
        set({ duration: Math.max(0, Number(duration) || 0) });
    },

    setFps(value) {
        const next = Number(value);
        set({ fps: Number.isFinite(next) && next > 0 ? next : 24 });
    },

    setKeyframeTimes(times) {
        set({ keyframeTimes: dedupeAndSortTimes(times) });
    },

    setSnapToKeyframes(value) {
        set({ snapToKeyframes: Boolean(value) });
    },

    setPreviewInterpolation(value) {
        set({ previewInterpolation: value === 'hold' ? 'hold' : 'interpolate' });
    },

    setIsPlaying(value) {
        set({ isPlaying: Boolean(value) });
    },
}));
