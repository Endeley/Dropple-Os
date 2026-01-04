export const EASING_PRESETS = Object.freeze({
    linear: { type: 'linear' },

    easeIn: { type: 'cubic', x1: 0.42, y1: 0.0, x2: 1.0, y2: 1.0 },
    easeOut: { type: 'cubic', x1: 0.0, y1: 0.0, x2: 0.58, y2: 1.0 },
    easeInOut: { type: 'cubic', x1: 0.42, y1: 0.0, x2: 0.58, y2: 1.0 },

    springSoft: { type: 'spring', tension: 120, friction: 14 },
    springMedium: { type: 'spring', tension: 180, friction: 18 },
    springStiff: { type: 'spring', tension: 240, friction: 22 },
});
