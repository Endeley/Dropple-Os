function normalizeIds(ids = []) {
    return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string' && id.trim().length > 0) : [];
}

export function resolveSelectionContextMenuModel({
    targetNodeId = null,
    selectionIds = [],
    nodesById = {},
    hasMotionForNode = false,
} = {}) {
    if (typeof targetNodeId !== 'string' || targetNodeId.trim().length === 0) {
        return Object.freeze({
            shouldOpen: false,
            nodeId: null,
            actionIds: [],
            canGroup: false,
            canUngroup: false,
            canAttachMotion: false,
            canRemoveMotion: false,
        });
    }

    const normalizedSelectionIds = normalizeIds(selectionIds);
    const targetIsSelected = normalizedSelectionIds.includes(targetNodeId);
    const actionIds = targetIsSelected ? normalizedSelectionIds : [targetNodeId];
    const primaryNode = actionIds.length === 1 ? nodesById?.[actionIds[0]] ?? null : null;

    return Object.freeze({
        shouldOpen: actionIds.length > 0,
        nodeId: targetNodeId,
        actionIds,
        canGroup: actionIds.length > 1,
        canUngroup: actionIds.length === 1 && primaryNode?.type === 'group',
        canAttachMotion: actionIds.length === 1 && primaryNode?.type !== 'group' && !hasMotionForNode,
        canRemoveMotion: actionIds.length === 1 && primaryNode?.type !== 'group' && hasMotionForNode,
    });
}
