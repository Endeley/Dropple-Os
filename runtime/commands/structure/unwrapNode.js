import { EventTypes } from '@/core/events/eventTypes.js';
import { getSceneGraph } from '@/runtime/document/documentAdapter';

export function createUnwrapNodeEvent({ runtimeState, nodeId }) {
    const graph = getSceneGraph(runtimeState);
    if (!nodeId) {
        return null;
    }
    if (runtimeState && !graph?.nodes?.[nodeId]) {
        return null;
    }

    return {
        type: EventTypes.NODE_UNWRAP,
        payload: { nodeId },
    };
}

export function unwrapNodeCommand({ runtimeState, nodeId, dispatch }) {
    if (typeof dispatch !== 'function') {
        return null;
    }

    const graph = getSceneGraph(runtimeState);
    const childrenIds = Array.isArray(graph?.nodes?.[nodeId]?.children)
        ? [...graph.nodes[nodeId].children]
        : [];

    const event = createUnwrapNodeEvent({ runtimeState, nodeId });
    if (!event) {
        return null;
    }

    const result = dispatch(event);

    if (childrenIds.length) {
        dispatch({
            type: EventTypes.SELECTION_SET,
            payload: { ids: childrenIds },
        });
    }

    return result;
}
