import { EventTypes } from '@/core/events/eventTypes.js';
import { getSceneGraph } from '@/runtime/document/documentAdapter';

export function createWrapSelectionEvent({ runtimeState, nodeIds, wrapperNode, parentId, index }) {
    const ids = Array.isArray(nodeIds) ? nodeIds.filter(Boolean) : [];
    const graph = getSceneGraph(runtimeState);
    if (!ids.length || !wrapperNode?.id) {
        return null;
    }
    if (
        runtimeState &&
        (!ids.every((id) => graph?.nodes?.[id]) ||
            (parentId != null && !graph?.nodes?.[parentId]))
    ) {
        return null;
    }

    return {
        type: EventTypes.NODE_WRAP,
        payload: {
            nodeIds: ids,
            wrapperNode,
            parentId,
            index,
        },
    };
}

export function wrapSelection({ runtimeState, nodeIds, wrapperNode, parentId, index, dispatch }) {
    if (typeof dispatch !== 'function') {
        return null;
    }

    const event = createWrapSelectionEvent({ runtimeState, nodeIds, wrapperNode, parentId, index });
    if (!event) {
        return null;
    }

    const result = dispatch(event);

    dispatch({
        type: EventTypes.SELECTION_SET,
        payload: { ids: [wrapperNode.id] },
    });

    return result;
}
