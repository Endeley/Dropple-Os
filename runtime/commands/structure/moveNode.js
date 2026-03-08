import { EventTypes } from '@/core/events/eventTypes.js';

export function createMoveNodeEvent({ nodeId, nodeIds, parentId, index }) {
    const ids = Array.isArray(nodeIds) ? nodeIds.filter(Boolean) : [];
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

    if ((!payload.nodeId && !payload.nodeIds?.length) || !parentId) {
        return null;
    }

    return {
        type: EventTypes.NODE_REPARENT,
        payload,
    };
}

export function moveNode({ dispatch, nodeId, nodeIds, parentId, index }) {
    if (typeof dispatch !== 'function') {
        return null;
    }

    const event = createMoveNodeEvent({ nodeId, nodeIds, parentId, index });
    if (!event) {
        return null;
    }

    return dispatch(event);
}
