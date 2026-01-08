export function selectLessonRange(events, fromId, toId) {
  const start = events.findIndex((e) => e.id === fromId);
  const end = events.findIndex((e) => e.id === toId);

  if (start === -1 || end === -1 || end < start) {
    throw new Error('Invalid lesson range');
  }

  return events.slice(start, end + 1);
}
