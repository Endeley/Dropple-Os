/**
 * Deterministic easing presets for timeline evaluation.
 */
export const easingPresets = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => 1 - Math.pow(1 - t, 2),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
};
