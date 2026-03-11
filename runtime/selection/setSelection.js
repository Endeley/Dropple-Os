import { EventTypes } from '@/core/events/eventTypes.js';

export function setSelection(ids, primary = null) {
    return {
        type: EventTypes.SELECTION_SET,
        payload: {
            ids,
            primary,
        },
    };
}
