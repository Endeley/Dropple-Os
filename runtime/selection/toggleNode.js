import { EventTypes } from '@/core/events/eventTypes.js';

export function toggleNode(nodeId) {
    return {
        type: EventTypes.SELECTION_TOGGLE,
        payload: {
            id: nodeId,
        },
    };
}
