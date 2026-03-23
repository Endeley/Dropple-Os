export function computeGroupMoveUpdates(group, delta) {
    if (!group || !Array.isArray(group.nodeIds) || group.nodeIds.length === 0) {
        return [];
    }

    const members = group.members ?? {};
    const dx = delta?.dx ?? 0;
    const dy = delta?.dy ?? 0;

    return group.nodeIds
        .map((nodeId) => {
            const member = members[nodeId];
            if (!member?.originBounds || !member?.offsetFromGroupOrigin) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[groupMove] invalid member', nodeId);
                }
                return null;
            }

            return {
                nodeId,
                x: group.bounds.x + dx + member.offsetFromGroupOrigin.x,
                y: group.bounds.y + dy + member.offsetFromGroupOrigin.y,
            };
        })
        .filter(Boolean);
}
