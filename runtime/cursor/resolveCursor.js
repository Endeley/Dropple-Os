export function resolveCursor(events, cursor) {
  if (cursor.mode === 'live') {
    const lastEvent = events[events.length - 1];
    return {
      ...cursor,
      eventId: lastEvent ? lastEvent.id : null,
    };
  }

  return cursor;
}
