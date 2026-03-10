function interpolateValue(a, b, t) {
    if (typeof a === 'number' && typeof b === 'number') {
        return a + (b - a) * t;
    }

    return t < 1 ? a : b;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function evaluateClip(clip, time) {
    const keyframes = (clip?.keyframes || [])
        .slice()
        .sort((a, b) => (a?.t || 0) - (b?.t || 0));

    if (!keyframes.length) return undefined;

    let previous = null;
    let next = null;

    for (const keyframe of keyframes) {
        if ((keyframe?.t || 0) <= time) {
            previous = keyframe;
            continue;
        }
        next = keyframe;
        break;
    }

    if (!previous) return keyframes[0]?.v;
    if (!next) return previous?.v;

    const duration = (next.t || 0) - (previous.t || 0);
    if (duration <= 0) return next?.v;

    const localT = clamp((time - previous.t) / duration, 0, 1);
    return interpolateValue(previous.v, next.v, localT);
}

export function evaluateMotion(document, time = 0) {
    const result = {};
    const clips = document?.motion?.clips || {};

    for (const clip of Object.values(clips)) {
        if (!clip?.target || !clip?.property) continue;

        const value = evaluateClip(clip, time);
        if (value === undefined) continue;

        if (!result[clip.target]) {
            result[clip.target] = {};
        }

        result[clip.target][clip.property] = value;
    }

    return result;
}
