import { EventTypes } from '@/core/events/eventTypes.js';

export function selectNode(nodeId) {
    return {
        type: EventTypes.SELECTION_SET,
        payload: {
            ids: [nodeId],
            primary: nodeId,
        },
    };
}
