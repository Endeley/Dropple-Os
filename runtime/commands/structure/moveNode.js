import { EventTypes } from '@/core/events/eventTypes.js';
import { getSceneGraph } from '@/runtime/document/documentAdapter';

export function createMoveNodeEvent({ runtimeState, nodeId, nodeIds, parentId, index }) {
    const ids = Array.isArray(nodeIds) ? nodeIds.filter(Boolean) : [];
    const graph = getSceneGraph(runtimeState);
    const payload =
        ids.length > 0
            ? {
                  nodeIds: ids,
                  parentId,
                  index,
              }
            : {
                  nodeId,
                  parentId,
                  index,
              };

    const movingIds = payload.nodeIds ?? (payload.nodeId ? [payload.nodeId] : []);
    const hasAllNodes = movingIds.every((id) => graph?.nodes?.[id]);
    const hasParent = Boolean(graph?.nodes?.[parentId]);

    if ((!payload.nodeId && !payload.nodeIds?.length) || !parentId) {
        return null;
    }
    if (runtimeState && (!hasAllNodes || !hasParent)) {
        return null;
    }

    return {
        type: EventTypes.NODE_REPARENT,
        payload,
    };
}

export function moveNode({ dispatch, runtimeState, nodeId, nodeIds, parentId, index }) {
    if (typeof dispatch !== 'function') {
        return null;
    }

    const event = createMoveNodeEvent({ runtimeState, nodeId, nodeIds, parentId, index });
    if (!event) {
        return null;
    }

    return dispatch(event);
}
