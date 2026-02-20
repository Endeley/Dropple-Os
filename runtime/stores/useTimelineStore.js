import { create } from 'zustand';
import {
    dedupeAndSortTimes,
    getNearestKeyframeTime,
    getNextKeyframeTime,
    getPrevKeyframeTime,
} from '@/runtime/timeline/keyframeTimeUtils.js';

/**
 * UI-only timeline state for scrubbing preview.
 * Never touches reducers or runtime state directly.
 */
export const useTimelineStore = create((set, get) => ({
    currentTime: 0,
    duration: 5000,
    isScrubbing: false,
    fps: 24,
    keyframeTimes: [],
    snapToKeyframes: false,
    previewInterpolation: 'interpolate',
    isPlaying: false,

    setTime(t, options = {}) {
        const { snap = true, forceSnap = false } = options;
        const state = get();
        const duration = Number.isFinite(state.duration) ? state.duration : 0;
        const frameMs = 1000 / (state.fps || 24);
        let next = Math.max(0, t);

        if (duration > 0) {
            next = Math.min(next, duration);
        }

        if (snap && state.snapToKeyframes && (state.isScrubbing || forceSnap)) {
            const threshold = frameMs / 2;
            const snapped = getNearestKeyframeTime(state.keyframeTimes, next, threshold);
            if (Number.isFinite(snapped)) {
                next = snapped;
            }
        }

        set({ currentTime: next });
    },

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

    stepForwardFrame() {
        const state = get();
        const frameMs = 1000 / (state.fps || 24);
        const next = state.currentTime + frameMs;
        state.setTime(next, { forceSnap: true });
    },

    stepBackwardFrame() {
        const state = get();
        const frameMs = 1000 / (state.fps || 24);
        const next = state.currentTime - frameMs;
        state.setTime(next, { forceSnap: true });
    },

    stepNextKeyframe() {
        const state = get();
        const next = getNextKeyframeTime(state.keyframeTimes, state.currentTime);
        if (Number.isFinite(next)) {
            state.setTime(next, { snap: false });
        }
    },

    stepPreviousKeyframe() {
        const state = get();
        const prev = getPrevKeyframeTime(state.keyframeTimes, state.currentTime);
        if (Number.isFinite(prev)) {
            state.setTime(prev, { snap: false });
        }
    },
}));
