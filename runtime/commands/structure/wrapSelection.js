import { EventTypes } from '@/core/events/eventTypes.js';

export function createWrapSelectionEvent({ nodeIds, wrapperNode, parentId, index }) {
    const ids = Array.isArray(nodeIds) ? nodeIds.filter(Boolean) : [];
    if (!ids.length || !wrapperNode?.id) {
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

export function wrapSelection({ nodeIds, wrapperNode, parentId, index, dispatch }) {
    if (typeof dispatch !== 'function') {
        return null;
    }

    const event = createWrapSelectionEvent({ nodeIds, wrapperNode, parentId, index });
    if (!event) {
        return null;
    }

    return dispatch(event);
}
