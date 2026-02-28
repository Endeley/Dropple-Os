import { MoveSession } from '../interactions/input/sessions/MoveSession.js';
import { ResizeSession } from '../interactions/input/sessions/ResizeSession.js';
import { getSnapRadius } from './snap/snapConfig.js';

export function createGroupMoveSession({
    nodeIds,
    pointer,
    modifiers,
    nodesById = {},
    animatedNodesById = {},
    nearestSnapshot = null,
    zoomTier = 'normal',
}) {
    if (!Array.isArray(nodeIds) || nodeIds.length < 2) return null;

    const resolvedNodesById =
        nodesById && Object.keys(nodesById).length > 0 ? nodesById : animatedNodesById || {};

    const nodes = nodeIds.map((id) => resolvedNodesById[id]).filter(Boolean);
    const siblings = Object.values(resolvedNodesById).filter((n) => n && !nodeIds.includes(n.id));

    const snapRadius = getSnapRadius(zoomTier);
    const snapTargets = Array.isArray(nearestSnapshot?.nearest)
        ? nearestSnapshot.nearest.map((entry) => ({
              id: entry.id,
              ...entry.bounds,
          }))
        : [];

    return new MoveSession({
        nodeIds,
        nodes,
        siblings,
        canvas: null,
        startPointer: pointer,
        options: { snapRadius, snapTargets, modifiers },
    });
}

export function createGroupResizeSession({
    nodeIds,
    pointer,
    handle,
    modifiers,
    nodesById = {},
}) {
    if (!Array.isArray(nodeIds) || nodeIds.length < 2) return null;

    const nodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
    const siblings = Object.values(nodesById).filter((n) => n && !nodeIds.includes(n.id));

    return new ResizeSession({
        nodeIds,
        nodes,
        siblings,
        startPointer: pointer,
        handle,
        options: {
            lockAspectRatio: !!modifiers?.shiftKey,
        },
    });
}
