// export/verify/verifyMotionExport.js

/**
 * Verifies that motion preview matches export evaluation.
 *
 * 🔒 Rules:
 * - No UI
 * - No reducers
 * - No side effects
 */

const EPSILON = 0.001;

/**
 * Shallow numeric compare with tolerance.
 */
function nearlyEqual(a, b, eps = EPSILON) {
    if (typeof a !== 'number' || typeof b !== 'number') return false;
    return Math.abs(a - b) <= eps;
}

/**
 * Compare node states at a given time.
 */
function compareNodes(previewNodes, exportedNodes) {
    const errors = [];

    for (const [id, previewNode] of Object.entries(previewNodes)) {
        const exportedNode = exportedNodes[id];
        if (!exportedNode) {
            errors.push(`Missing exported node: ${id}`);
            continue;
        }

        for (const key of Object.keys(previewNode)) {
            const a = previewNode[key];
            const b = exportedNode[key];

            if (typeof a === 'number' && typeof b === 'number') {
                if (!nearlyEqual(a, b)) {
                    errors.push(`Mismatch ${id}.${key}: preview=${a}, export=${b}`);
                }
            }
        }
    }

    return errors;
}

/**
 * Main verification entry.
 *
 * @param {Object} params
 * @param {Function} params.previewAtTime - returns node map
 * @param {Function} params.exportEvaluateAt - returns node map
 * @param {number[]} params.sampleTimes - times to check (ms)
 */
export function verifyMotionExport({ previewAtTime, exportEvaluateAt, sampleTimes }) {
    if (typeof previewAtTime !== 'function') {
        throw new Error('verifyMotionExport: previewAtTime is required');
    }
    if (typeof exportEvaluateAt !== 'function') {
        throw new Error('verifyMotionExport: exportEvaluateAt is required');
    }
    if (!Array.isArray(sampleTimes)) {
        throw new Error('verifyMotionExport: sampleTimes must be an array');
    }

    const allErrors = [];

    for (const time of sampleTimes) {
        const previewNodes = previewAtTime(time);
        const exportedNodes = exportEvaluateAt(time);

        const errors = compareNodes(previewNodes, exportedNodes);
        if (errors.length) {
            allErrors.push({
                time,
                errors,
            });
        }
    }

    return {
        ok: allErrors.length === 0,
        errors: allErrors,
    };
}
