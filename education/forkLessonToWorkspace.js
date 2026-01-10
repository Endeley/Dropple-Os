import { normalizeEvents, snapshotToEvents } from './lessonEvents';

export function forkLessonToWorkspace(lesson) {
  const snapshotEvents = lesson.baseSnapshot
    ? snapshotToEvents(lesson.baseSnapshot)
    : [];
  const timelineEvents = normalizeEvents(lesson.eventTimeline || []);

  return {
    id: crypto.randomUUID(),
    mode: lesson.mode || 'design',
    snapshot: lesson.baseSnapshot ? structuredClone(lesson.baseSnapshot) : null,
    events: [...snapshotEvents, ...timelineEvents],
    forkedFromLesson: lesson.id,
  };
}
