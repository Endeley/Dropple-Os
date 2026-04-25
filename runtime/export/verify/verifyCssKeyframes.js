import { evaluateCssExportAt } from './evaluateExportedMotionAt.js';

const EPSILON = 0.001;

function nearlyEqual(a, b, eps = EPSILON) {
    if (typeof a !== 'number' || typeof b !== 'number') return false;
    return Math.abs(a - b) <= eps;
}

/**
 * Verify CSS animation output.
 *
 * @param {Object} params
 * @param {string} params.cssText
 * @param {Function} params.previewAtTime
 * @param {number[]} params.sampleTimes
 */
export function verifyCssKeyframes({ cssText, previewAtTime, sampleTimes }) {
    if (typeof cssText !== 'string') {
        throw new Error('verifyCssKeyframes: cssText is required');
    }
    if (typeof previewAtTime !== 'function') {
        throw new Error('verifyCssKeyframes: previewAtTime is required');
    }

    const errors = [];

    for (const time of sampleTimes) {
        const previewState = previewAtTime(time);
        const cssState = evaluateCssExportAt({
            cssText,
            timeMs: time,
        });

        for (const [nodeId, exportedNode] of Object.entries(cssState)) {
            const previewNode = previewState[nodeId];
            if (!previewNode) continue;

            for (const prop of Object.keys(exportedNode)) {
                const a = previewNode[prop];
                const b = exportedNode[prop];

                if (typeof a === 'number' && typeof b === 'number' && !nearlyEqual(a, b)) {
                    errors.push(`[CSS] ${nodeId}.${prop} mismatch at ${time}ms: preview=${a}, css=${b}`);
                }
            }
        }
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}
