import { resolveEasing } from './resolveEasing.js';

export function sampleProperty(keyframes, time) {
    if (!keyframes || keyframes.length === 0) return null;

    if (time <= keyframes[0].time) return keyframes[0].value;
    if (time >= keyframes[keyframes.length - 1].time) {
        return keyframes[keyframes.length - 1].value;
    }

    for (let i = 0; i < keyframes.length - 1; i++) {
        const a = keyframes[i];
        const b = keyframes[i + 1];

        if (time >= a.time && time <= b.time) {
            const rawT = (time - a.time) / (b.time - a.time);
            const easingFn = resolveEasing(b.easing);
            const t = easingFn(rawT);

            return interpolateValue(a.value, b.value, t);
        }
    }

    return null;
}

function interpolateValue(a, b, t) {
    if (typeof a === 'number' && typeof b === 'number') {
        return a + (b - a) * t;
    }

    // future: vectors, colors, transforms
    return b;
}
