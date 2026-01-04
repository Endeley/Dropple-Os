import { EASING_PRESETS } from '../easing/easingPresets.js';

/**
 * Ensures every keyframe has an explicit easing preset object.
 * Falls back to linear if unknown.
 */
export function normalizeKeyframes(keyframes = []) {
    return keyframes.map((kf, index) => ({
        time: kf.time,
        value: kf.value,
        easing: EASING_PRESETS[kf.easing] || EASING_PRESETS.linear,
        index,
    }));
}
