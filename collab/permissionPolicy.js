export function canUserPerform({ user, event, state }) {
    const { type, payload } = event;

    // Admin override
    if (user?.role === 'admin') return true;

    // Node-specific rules
    const nodeId = payload?.id;
    if (nodeId) {
        const node = state?.nodes?.[nodeId];
        if (!node) return false;

        // Ownership rule
        if (node.meta?.ownerId && node.meta.ownerId !== user.id) {
            return false;
        }
    }

    // Allowed by default
    return true;
}
