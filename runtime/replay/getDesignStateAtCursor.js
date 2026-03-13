import { resolveCursor } from '../cursor/resolveCursor.js';
import { getEventsUpToCursor } from '../events/getEventsUpToCursor.js';
import { replayEvents } from '@/core/persistence/replayEngine.js';

export function getDesignStateAtCursor({
  events,
  cursor,
  uptoIndex,
}) {
  const cursorFromIndex =
    typeof uptoIndex === 'number'
      ? { eventId: events[uptoIndex]?.id ?? null }
      : null;
  const resolvedCursor = resolveCursor(events, cursorFromIndex || cursor);

  const relevantEvents = getEventsUpToCursor(events, resolvedCursor);
  return replayEvents({ events: relevantEvents });
}
