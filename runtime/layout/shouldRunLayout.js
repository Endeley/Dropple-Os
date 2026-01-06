// runtime/layout/shouldRunLayout.js

import { EventTypes } from '@/core/events/eventTypes';

const LAYOUT_EVENTS = new Set([
    EventTypes.NODE_CREATE,
    EventTypes.NODE_DELETE,
    EventTypes.NODE_ATTACH,
    EventTypes.NODE_DETACH,
    EventTypes.NODE_REORDER,
    EventTypes.NODE_RESIZE,
]);

export function shouldRunLayout(event) {
    return LAYOUT_EVENTS.has(event?.type);
}
