import { resolveCursor } from '../cursor/resolveCursor.js';
import { reconstructDesignState } from './reconstructDesignState.js';

export function getDesignStateAtCursor({
  events,
  cursor,
}) {
  const resolvedCursor = resolveCursor(events, cursor);

  return reconstructDesignState({
    events,
    cursor: resolvedCursor,
  });
}
