/**
 * Samples a track value at a given time (linear, preview-only).
 * No easing, no side effects. Intended for ghost/preview layers.
 */
export function previewTrackAtTime(track, time) {
    const frames = track?.keyframes || [];
    if (!frames.length) return null;

    if (time <= frames[0].time) return frames[0].value;
    if (time >= frames[frames.length - 1].time) return frames[frames.length - 1].value;

    for (let i = 0; i < frames.length - 1; i++) {
        const a = frames[i];
        const b = frames[i + 1];

        if (time >= a.time && time <= b.time) {
            const t = (time - a.time) / (b.time - a.time);
            return lerp(a.value, b.value, t);
        }
    }
    return null;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}
