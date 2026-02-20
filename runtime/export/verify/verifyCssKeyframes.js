// export/verify/verifyCssKeyframes.js

/**
 * Verifies CSS keyframes against timeline preview.
 *
 * 🔒 Rules:
 * - No DOM required
 * - No UI
 * - Deterministic numeric comparison
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
 * Parse a CSS keyframes block into numeric timelines.
 *
 * Supports:
 * - transform: translate(xpx, ypx)
 * - opacity
 */
function parseKeyframes(cssText) {
    const keyframes = {};

    const blockRegex = /@keyframes\s+([^{\s]+)\s*{([^}]+)}/gms;
    let blockMatch;

    while ((blockMatch = blockRegex.exec(cssText))) {
        const name = blockMatch[1];
        const body = blockMatch[2];

        keyframes[name] = [];

        const frameRegex = /([\d.]+)%\s*{([^}]+)}/g;
        let frameMatch;

        while ((frameMatch = frameRegex.exec(body))) {
            const percent = parseFloat(frameMatch[1]) / 100;
            const rules = frameMatch[2];

            const entry = { t: percent };

            const opacityMatch = /opacity:\s*([\d.]+)/.exec(rules);
            if (opacityMatch) {
                entry.opacity = parseFloat(opacityMatch[1]);
            }

            const translateMatch = /translate\(\s*([\d.-]+)px,\s*([\d.-]+)px\s*\)/.exec(rules);
            if (translateMatch) {
                entry.x = parseFloat(translateMatch[1]);
                entry.y = parseFloat(translateMatch[2]);
            }

            keyframes[name].push(entry);
        }
    }

    return keyframes;
}

/**
 * Linear interpolation helper.
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Evaluate parsed keyframes at normalized time t ∈ [0,1].
 */
function evaluateKeyframes(frames, t) {
    if (!frames || frames.length === 0) return {};

    frames.sort((a, b) => a.t - b.t);

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

    for (const key of ['x', 'y', 'opacity']) {
        if (prev[key] != null && next[key] != null) {
            out[key] = lerp(prev[key], next[key], localT);
        }
    }

    return out;
}

/**
 * Verify CSS animation output.
 *
 * @param {Object} params
 * @param {string} params.cssText
 * @param {Function} params.previewAtTime
 * @param {number[]} params.sampleTimes
 * @param {number} params.duration
 */
export function verifyCssKeyframes({ cssText, previewAtTime, sampleTimes, duration }) {
    if (typeof cssText !== 'string') {
        throw new Error('verifyCssKeyframes: cssText is required');
    }
    if (typeof previewAtTime !== 'function') {
        throw new Error('verifyCssKeyframes: previewAtTime is required');
    }

    const parsed = parseKeyframes(cssText);
    const errors = [];

    for (const [name, frames] of Object.entries(parsed)) {
        for (const time of sampleTimes) {
            const tNorm = time / duration;
            const cssState = evaluateKeyframes(frames, tNorm);
            const previewState = previewAtTime(time);

            for (const [nodeId, previewNode] of Object.entries(previewState)) {
                for (const prop of Object.keys(cssState)) {
                    const a = previewNode[prop];
                    const b = cssState[prop];

                    if (typeof a === 'number' && typeof b === 'number' && !nearlyEqual(a, b)) {
                        errors.push(`[${name}] ${nodeId}.${prop} mismatch at ${time}ms: preview=${a}, css=${b}`);
                    }
                }
            }
        }
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}
