import { easingPresets } from './easingPresets.js';

/**
 * Evaluates timeline at a specific time.
 * Pure function, no side effects.
 *
 * @param {Object} timeline
 * @param {number} time
 * @param {Object} baseState  runtime state snapshot
 *
 * @returns {Object} previewState
 */
export function evaluateTimeline(timeline, time, baseState) {
    if (!timeline || !baseState) return baseState;

    const t = clamp(time, 0, timeline.duration);
    const nextState = {
        ...baseState,
        nodes: { ...baseState.nodes },
    };

    timeline.tracks.forEach((track) => {
        const { targetId, property, keyframes, easing = 'linear' } = track;
        const node = nextState.nodes[targetId];
        if (!node || !keyframes || keyframes.length === 0) return;

        const value = interpolateKeyframes(keyframes, t, easing);
        if (value === undefined) return;

        nextState.nodes[targetId] = {
            ...node,
            [property]: value,
        };
    });

    return nextState;
}

function interpolateKeyframes(keyframes, time, easingName) {
    const easingFn = easingPresets[easingName] || easingPresets.linear;

    let prev = null;
    let next = null;

    for (let i = 0; i < keyframes.length; i++) {
        const kf = keyframes[i];
        if (kf.time <= time) prev = kf;
        if (kf.time > time) {
            next = kf;
            break;
        }
    }

    if (!prev) return keyframes[0]?.value;
    if (!next) return prev.value;

    const localT = (time - prev.time) / (next.time - prev.time);
    const easedT = easingFn(clamp(localT, 0, 1));

    return lerp(prev.value, next.value, easedT);
}

function lerp(a, b, t) {
    if (typeof a === 'number' && typeof b === 'number') {
        return a + (b - a) * t;
    }
    return t < 1 ? a : b;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
