// Runtime easing helpers (performance-focused, preview/playback only)
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export const easeInOut = (t) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
