/**
 * Timeline = collection of tracks.
 * Time unit: milliseconds.
 */
export function createTimeline({ duration = 1000, tracks = [] } = {}) {
    return {
        duration,
        tracks,
    };
}

/**
 * Track = animates ONE property on ONE target.
 */
export function createTrack({ targetId, property, keyframes = [], easing = 'linear' } = {}) {
    return {
        targetId,
        property,
        easing,
        keyframes,
    };
}

/**
 * Keyframe = value at time.
 */
export function createKeyframe({ time, value }) {
    return { time, value };
}
