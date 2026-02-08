import { create } from 'zustand';

/**
 * Constraint visualizer settings (UI-only).
 */
export const useConstraintVisualizerStore = create((set) => ({
    enabled: true,
    showFollow: true,
    showPin: true,
    showAim: true,
    showSockets: true,
    setEnabled(value) {
        set({ enabled: Boolean(value) });
    },
    setShowFollow(value) {
        set({ showFollow: Boolean(value) });
    },
    setShowPin(value) {
        set({ showPin: Boolean(value) });
    },
    setShowAim(value) {
        set({ showAim: Boolean(value) });
    },
    setShowSockets(value) {
        set({ showSockets: Boolean(value) });
    },
}));
