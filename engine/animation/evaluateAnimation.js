import { resolveEasing } from '@/timeline/resolveEasing.js';
import { lerp } from '@/runtime/animation/lerp.js';

/**
 * Evaluate animation tracks at time t (ms).
 * Pure, deterministic, read-only.
 */
export function evaluateAnimation({ timeline, timeMs }) {
    if (!timeline || !Number.isFinite(timeMs)) {
        return {};
    }

    const result = {};
    const tracks = timeline.tracks || [];

    for (const track of tracks) {
        const { nodeId, property, keyframes } = track;
        if (!nodeId || !property || !keyframes?.length) continue;

        // Sort locally (do not mutate original)
        const frames = [...keyframes].sort((a, b) => a.time - b.time);

        let value;

        // Before first
        if (timeMs <= frames[0].time) {
            value = frames[0].value;
        }
        // After last
        else if (timeMs >= frames[frames.length - 1].time) {
            value = frames[frames.length - 1].value;
        }
        // Between
        else {
            for (let i = 0; i < frames.length - 1; i += 1) {
                const a = frames[i];
                const b = frames[i + 1];

                if (timeMs >= a.time && timeMs <= b.time) {
                    const span = b.time - a.time;
                    const t = span === 0 ? 0 : (timeMs - a.time) / span;

                    const easing = resolveEasing(b.easing || 'linear');
                    const eased = easing ? easing(t) : t;

                    value = lerp(a.value, b.value, eased);
                    break;
                }
            }
        }

        if (value === undefined) continue;

        if (!result[nodeId]) {
            result[nodeId] = {};
        }
        result[nodeId][property] = value;
    }

    return result;
}
