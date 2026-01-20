/**
 * DERIVED LAYOUT PASS
 *
 * ⚠️ This function computes derived presentation state ONLY.
 *
 * RULES:
 * - Must be pure and deterministic
 * - Must NOT emit events
 * - Must NOT mutate history
 * - Must NOT introduce side effects
 * - Safe to re-run at any time
 *
 * Layout output is NOT persisted and NOT replayed.
 */

export function applyLayoutPass(runtimeState) {
    if (!runtimeState || !runtimeState.nodes) {
        return { nodes: {}, rootIds: [] };
    }

    const derivedNodes = {};
    const nodes = runtimeState.nodes;

    for (const id in nodes) {
        const node = nodes[id];

        // IMPORTANT:
        // Layout may only COMPUTE geometry.
        // It must never invent semantic state.
        derivedNodes[id] = {
            ...node,
            // Example: layout normalization hook
            x: node.x ?? 0,
            y: node.y ?? 0,
            width: node.width ?? 100,
            height: node.height ?? 100,
        };
    }

    return {
        nodes: derivedNodes,
        rootIds: runtimeState.rootIds || [],
    };
}
