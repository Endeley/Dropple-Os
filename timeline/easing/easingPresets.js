// UX-level easing presets (labels, defaults, UI-facing only)
export const EASING_PRESETS = Object.freeze({
    linear: { type: 'linear' },

    easeIn: { type: 'cubic', x1: 0.42, y1: 0.0, x2: 1.0, y2: 1.0 },
    easeOut: { type: 'cubic', x1: 0.0, y1: 0.0, x2: 0.58, y2: 1.0 },
    easeInOut: { type: 'cubic', x1: 0.42, y1: 0.0, x2: 0.58, y2: 1.0 },

    springSoft: { type: 'spring', tension: 120, friction: 14 },
    springMedium: { type: 'spring', tension: 180, friction: 18 },
    springStiff: { type: 'spring', tension: 240, friction: 22 },
});

// Deterministic easing functions for timeline evaluation.
export const easingPresets = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => 1 - Math.pow(1 - t, 2),
    easeInOut: (t) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};
