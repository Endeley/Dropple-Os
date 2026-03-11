import { EventTypes } from '@/core/events/eventTypes.js';

export function clearSelection() {
    return {
        type: EventTypes.SELECTION_CLEAR,
    };
}
