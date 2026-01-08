import { resolveCursor } from '../cursor/resolveCursor.js';
import { reconstructDesignState } from './reconstructDesignState.js';

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

  return reconstructDesignState({
    events,
    cursor: resolvedCursor,
  });
}
