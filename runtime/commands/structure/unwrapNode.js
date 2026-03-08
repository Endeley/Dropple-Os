import { EventTypes } from '@/core/events/eventTypes.js';

export function createUnwrapNodeEvent({ nodeId }) {
    if (!nodeId) {
        return null;
    }

    return {
        type: EventTypes.NODE_UNWRAP,
        payload: { nodeId },
    };
}

export function unwrapNodeCommand({ nodeId, dispatch }) {
    if (typeof dispatch !== 'function') {
        return null;
    }

    const event = createUnwrapNodeEvent({ nodeId });
    if (!event) {
        return null;
    }

    return dispatch(event);
}
