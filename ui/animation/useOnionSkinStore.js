import { create } from 'zustand';

/**
 * Onion-skin / ghost-frame settings (UI-only).
 */
export const useOnionSkinStore = create((set) => ({
    enabled: false,
    prevFrames: 1,
    nextFrames: 0,
    stepMs: 100,
    opacity: 0.25,
    setEnabled(value) {
        set({ enabled: Boolean(value) });
    },
    setPrevFrames(value) {
        set({ prevFrames: Math.max(0, Number(value) || 0) });
    },
    setNextFrames(value) {
        set({ nextFrames: Math.max(0, Number(value) || 0) });
    },
    setStepMs(value) {
        const next = Number(value);
        set({ stepMs: Number.isFinite(next) && next > 0 ? next : 100 });
    },
    setOpacity(value) {
        const next = Number(value);
        set({ opacity: Number.isFinite(next) ? Math.max(0, Math.min(next, 1)) : 0.25 });
    },
}));
