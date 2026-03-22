export function computeGroupMoveUpdates(group, delta) {
    if (!group?.active) return [];

    const members = group.members ?? {};
    const nodeIds = Array.isArray(group.nodeIds) ? [...group.nodeIds] : [];
    const dx = delta?.dx ?? 0;
    const dy = delta?.dy ?? 0;

    return nodeIds
        .map((nodeId) => {
            const member = members[nodeId];
            if (!member?.originBounds) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[groupMove] missing originBounds for', nodeId);
                }
                return null;
            }

            return {
                nodeId,
                x: member.originBounds.x + dx,
                y: member.originBounds.y + dy,
            };
        })
        .filter(Boolean);
}
