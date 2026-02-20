import { create } from 'zustand';

/**
 * Auto-keyframe policy (UI-only).
 * Does not touch runtime truth.
 */
export const useAutoKeyframeStore = create(() => ({
    enabled: true,
    properties: {
        position: true,
        size: true,
        rotation: false,
    },
    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
    },
    setProperty(key, value) {
        if (!key) return;
        this.properties = {
            ...(this.properties || {}),
            [key]: Boolean(value),
        };
    },
}));
