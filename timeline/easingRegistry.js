/**
 * Canonical easing registry. Deterministic and export-friendly.
 */
export const EASINGS = Object.freeze({
    linear: (t) => t,

    easeIn: (t) => t * t,

    easeOut: (t) => 1 - Math.pow(1 - t, 2),

    easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),

    easeInCubic: (t) => t * t * t,
});
