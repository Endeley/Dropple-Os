import { nanoid } from 'nanoid';
import { EventTypes } from '../../core/events/eventTypes.js';

export function createEditEvent(intent) {
    const ids = intent?.ids || [];
    if (!ids.length) return null;

    const type = intent?.type || 'layout';

    return {
        type: EventTypes.TIMELINE_EVENT_ADD,
        payload: {
            event: {
                id: nanoid(),
                time: Date.now(),
                type: `layout/${type}`,
                payload: { ids, source: intent?.source || 'canvas' },
            },
        },
    };
}
