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

export function createAnimationTrack({ id = null, target, property, clips = [] } = {}) {
    if (!target) {
        throw new Error('createAnimationTrack: target is required');
    }
    if (!property) {
        throw new Error('createAnimationTrack: property is required');
    }

    return {
        id, // assigned at commit boundary
        target, // nodeId
        property, // 'x' | 'y' | 'opacity' | 'scale' | etc.
        clips,
    };
}

export function createKeyframe({ id = null, time, value, easing = 'linear' } = {}) {
    if (time == null) {
        throw new Error('createKeyframe: time is required');
    }

    return {
        id, // assigned at commit boundary
        time, // ms
        value,
        easing,
    };
}
