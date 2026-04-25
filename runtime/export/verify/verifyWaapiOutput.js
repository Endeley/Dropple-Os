import { evaluateWaapiExportAt } from './evaluateExportedMotionAt.js';

const EPSILON = 0.001;

function nearlyEqual(a, b, eps = EPSILON) {
    if (typeof a !== 'number' || typeof b !== 'number') return false;
    return Math.abs(a - b) <= eps;
}

/**
 * Verify WAAPI export output.
 *
 * @param {Object} params
 * @param {Object|string} params.waapiKeyframesByNode
 * @param {Function} params.previewAtTime
 * @param {number[]} params.sampleTimes
 */
export function verifyWaapiOutput({ waapiKeyframesByNode, previewAtTime, sampleTimes }) {
    if (!waapiKeyframesByNode) {
        throw new Error('verifyWaapiOutput: waapiKeyframesByNode is required');
    }
    if (typeof previewAtTime !== 'function') {
        throw new Error('verifyWaapiOutput: previewAtTime is required');
    }

    const errors = [];

    for (const time of sampleTimes) {
        const previewNodes = previewAtTime(time);
        const waapiNodes = evaluateWaapiExportAt({
            waapiOutput: waapiKeyframesByNode,
            timeMs: time,
        });

        for (const [nodeId, waapiState] of Object.entries(waapiNodes)) {
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
