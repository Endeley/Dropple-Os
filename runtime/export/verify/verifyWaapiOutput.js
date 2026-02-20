// export/verify/verifyWaapiOutput.js

/**
 * Verifies WAAPI output against timeline preview.
 *
 * 🔒 Rules:
 * - No DOM mutation
 * - No UI
 * - Deterministic numeric comparison
 *
 * Assumes WAAPI export provides:
 * - keyframes: Array<{ offset, easing, transform?, opacity? }>
 */

const EPSILON = 0.001;

/**
 * Numeric comparison with tolerance.
 */
function nearlyEqual(a, b, eps = EPSILON) {
    if (typeof a !== 'number' || typeof b !== 'number') return false;
    return Math.abs(a - b) <= eps;
}

/**
 * Extract numeric values from WAAPI keyframe.
 *
 * Supports:
 * - opacity
 * - transform: translate(xpx, ypx)
 */
function extractFrameValues(frame) {
    const out = {};

    if (typeof frame.opacity === 'number') {
        out.opacity = frame.opacity;
    }

    if (typeof frame.transform === 'string') {
        const m = /translate\(\s*([\d.-]+)px,\s*([\d.-]+)px\s*\)/.exec(frame.transform);
        if (m) {
            out.x = parseFloat(m[1]);
            out.y = parseFloat(m[2]);
        }
    }

    return out;
}

/**
 * Linear interpolation.
 * (WAAPI easing is already baked into offsets in export stage)
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Evaluate WAAPI keyframes at normalized time t ∈ [0,1].
 */
function evaluateWaapi(keyframes, t) {
    if (!Array.isArray(keyframes) || keyframes.length === 0) {
        return {};
    }

    const frames = keyframes
        .map((kf) => ({
            t: kf.offset ?? 0,
            values: extractFrameValues(kf),
        }))
        .sort((a, b) => a.t - b.t);

    let prev = frames[0];
    let next = frames[frames.length - 1];

    for (let i = 0; i < frames.length - 1; i++) {
        if (t >= frames[i].t && t <= frames[i + 1].t) {
            prev = frames[i];
            next = frames[i + 1];
            break;
        }
    }

    const span = next.t - prev.t || 1;
    const localT = (t - prev.t) / span;

    const out = {};

    for (const key of Object.keys(prev.values)) {
        if (next.values[key] != null) {
            out[key] = lerp(prev.values[key], next.values[key], localT);
        }
    }

    return out;
}

/**
 * Verify WAAPI export output.
 *
 * @param {Object} params
 * @param {Array} params.waapiKeyframesByNode
 *   Shape: { [nodeId]: Keyframe[] }
 * @param {Function} params.previewAtTime
 * @param {number[]} params.sampleTimes
 * @param {number} params.duration
 */
export function verifyWaapiOutput({ waapiKeyframesByNode, previewAtTime, sampleTimes, duration }) {
    if (!waapiKeyframesByNode) {
        throw new Error('verifyWaapiOutput: waapiKeyframesByNode is required');
    }
    if (typeof previewAtTime !== 'function') {
        throw new Error('verifyWaapiOutput: previewAtTime is required');
    }

    const errors = [];

    for (const time of sampleTimes) {
        const tNorm = time / duration;
        const previewNodes = previewAtTime(time);

        for (const [nodeId, keyframes] of Object.entries(waapiKeyframesByNode)) {
            const waapiState = evaluateWaapi(keyframes, tNorm);
            const previewNode = previewNodes[nodeId];

            if (!previewNode) continue;

            for (const prop of Object.keys(waapiState)) {
                const a = previewNode[prop];
                const b = waapiState[prop];

                if (typeof a === 'number' && typeof b === 'number' && !nearlyEqual(a, b)) {
                    errors.push(`[WAAPI] ${nodeId}.${prop} mismatch at ${time}ms: preview=${a}, waapi=${b}`);
                }
            }
        }
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}
