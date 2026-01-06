// branching/merge/planMerge.js

/**
 * Plan a merge by selecting incoming events only.
 *
 * 🔒 Pure
 * 🔒 Deterministic
 */
export function planMerge({ targetBranch, sourceBranch }) {
    if (!targetBranch || !sourceBranch) return [];

    const targetEventIds = new Set(targetBranch.events.map((e) => e.id));

    return sourceBranch.events.filter((e) => !targetEventIds.has(e.id));
}
