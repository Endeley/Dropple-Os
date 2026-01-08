export function getEventsUpToCursor(events, cursor) {
  if (!cursor.eventId) return [];

  const index = events.findIndex((e) => e.id === cursor.eventId);
  if (index === -1) return [];

  return events.slice(0, index + 1);
}
