// branching/merge/computeMergeDiff.js

/**
 * Compute a merge diff between two branches.
 *
 * 🔒 Pure function
 * 🔒 No mutation
 *
 * Returns:
 * - events that will be merged
 * - affected nodeIds
 */
export function computeMergeDiff({ targetBranch, sourceBranch }) {
    if (!targetBranch || !sourceBranch) {
        return null;
    }

    const targetEventIds = new Set(targetBranch.events.map((e) => e.id));

    const incomingEvents = sourceBranch.events.filter((e) => !targetEventIds.has(e.id));

    const affectedNodeIds = new Set();

    for (const evt of incomingEvents) {
        const payload = evt.payload;

        if (!payload) continue;

        // Common node mutation patterns
        if (payload.id) {
            affectedNodeIds.add(payload.id);
        }

        if (Array.isArray(payload.nodeIds)) {
            payload.nodeIds.forEach((id) => affectedNodeIds.add(id));
        }
    }

    return {
        eventCount: incomingEvents.length,
        events: incomingEvents,
        affectedNodeIds: [...affectedNodeIds],
    };
}
