/**
 * Timeline schema for authoring motion.
 * Pure data: serializable, replay-safe, mode-agnostic.
 */
export function createTimeline({ duration = 1000 } = {}) {
    return {
        duration, // ms
        animations: [],
    };
}

export function createAnimationTrack({ target, property }) {
    return {
        id: crypto.randomUUID(),
        target, // nodeId
        property, // 'x' | 'y' | 'opacity' | 'scale' | etc.
        keyframes: [],
    };
}

export function createKeyframe({ time, value, easing = 'linear' }) {
    return {
        id: crypto.randomUUID(),
        time, // ms
        value,
        easing,
    };
}
