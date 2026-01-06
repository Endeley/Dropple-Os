// branching/merge/computeNodeDiff.js

/**
 * Compute visual diffs between node states.
 *
 * 🔒 Pure
 */
export function computeNodeDiff({ before, after }) {
    const diffs = [];

    const beforeNodes = before?.nodes || {};
    const afterNodes = after?.nodes || {};

    const allIds = new Set([...Object.keys(beforeNodes), ...Object.keys(afterNodes)]);

    for (const id of allIds) {
        const a = beforeNodes[id];
        const b = afterNodes[id];

        if (!a || !b) continue;

        const changed = a.x !== b.x || a.y !== b.y || a.width !== b.width || a.height !== b.height || a.opacity !== b.opacity;

        if (!changed) continue;

        diffs.push({
            id,
            before: {
                x: a.x,
                y: a.y,
                width: a.width,
                height: a.height,
                opacity: a.opacity,
            },
            after: {
                x: b.x,
                y: b.y,
                width: b.width,
                height: b.height,
                opacity: b.opacity,
            },
        });
    }

    return diffs;
}
