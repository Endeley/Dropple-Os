import { normalizeKeyframes } from '../normalize/normalizeKeyframes.js';

/**
 * Groups property keyframes into unified frames keyed by time.
 * Returns sorted array of { time, easing, values }.
 */
export function groupMotionFrames(tracks) {
    const frames = {};

    Object.entries(tracks || {}).forEach(([property, keyframes]) => {
        normalizeKeyframes(keyframes).forEach((kf) => {
            if (!frames[kf.time]) frames[kf.time] = { easing: kf.easing, values: {} };
            frames[kf.time].values[property] = kf.value;
        });
    });

    return Object.entries(frames)
        .map(([time, data]) => ({ time: Number(time), ...data }))
        .sort((a, b) => a.time - b.time);
}
