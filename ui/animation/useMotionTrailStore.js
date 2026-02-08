import { create } from 'zustand';

/**
 * Motion trail settings (UI-only).
 */
export const useMotionTrailStore = create((set) => ({
    enabled: false,
    steps: 12,
    stepMs: 80,
    opacity: 0.6,
    fade: true,
    setEnabled(value) {
        set({ enabled: Boolean(value) });
    },
    setSteps(value) {
        const next = Number(value);
        set({ steps: Number.isFinite(next) && next > 0 ? Math.floor(next) : 12 });
    },
    setStepMs(value) {
        const next = Number(value);
        set({ stepMs: Number.isFinite(next) && next > 0 ? next : 80 });
    },
    setOpacity(value) {
        const next = Number(value);
        set({ opacity: Number.isFinite(next) ? Math.max(0, Math.min(next, 1)) : 0.6 });
    },
    setFade(value) {
        set({ fade: Boolean(value) });
    },
}));
