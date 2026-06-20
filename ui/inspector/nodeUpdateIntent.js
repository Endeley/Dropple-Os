import { EventTypes } from '@/core/events/eventTypes.js';
import { canvasBus } from '../eventBus/canvasBus.js';

function normalizeNodeEvent(event) {
    if (!event?.type) return event;

    if (event.type === 'node.delete') {
        return {
            ...event,
            type: EventTypes.NODE_DELETE,
        };
    }

    return event;
}

export function nodeUpdateIntent(event) {
    if (!event?.type) return;

    const isNodeEvent =
        event.type.startsWith('node.') ||
        event.type.startsWith('node/');

    if (!isNodeEvent) return;

    canvasBus.emit('intent.node.update', { event: normalizeNodeEvent(event) });
}
