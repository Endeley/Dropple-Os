import { replayEvents } from './replayEngine.js';

function resolveCursor(events, cursor) {
    if (cursor?.mode === 'live') {
        const lastEvent = events[events.length - 1];
        return {
            ...cursor,
            eventId: lastEvent ? lastEvent.id : null,
        };
    }

    return cursor;
}

function getEventsUpToCursor(events, cursor) {
    if (!cursor?.eventId) return [];

    const index = events.findIndex((event) => event.id === cursor.eventId);
    if (index === -1) return [];

    return events.slice(0, index + 1);
}

export function getDesignStateAtCursor({ events, cursor, uptoIndex }) {
    const cursorFromIndex =
        typeof uptoIndex === 'number' ? { eventId: events[uptoIndex]?.id ?? null } : null;
    const resolvedCursor = resolveCursor(events, cursorFromIndex || cursor);

    const relevantEvents = getEventsUpToCursor(events, resolvedCursor);
    return replayEvents({ events: relevantEvents });
}
