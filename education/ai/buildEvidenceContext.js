export function buildEvidenceContext({
  lesson,
  eventId,
  compareToId,
}) {
  const events = lesson.timeline.events;

  const idx = events.findIndex((e) => e.id === eventId);
  if (idx === -1) throw new Error('Invalid anchor');

  const event = events[idx];
  const prev = idx > 0 ? events[idx - 1] : null;

  const annotations = lesson.annotations.filter(
    (a) => a.eventId === eventId
  );

  return {
    event,
    previousEvent: prev,
    annotations,
    lessonMeta: lesson.meta,
    compareEvent: compareToId
      ? events.find((e) => e.id === compareToId)
      : null,
  };
}
