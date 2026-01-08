export function createLessonExport({
  lessonId,
  runId,
  title,
  description,
  author,
  fromEventId,
  toEventId,
  events,
  annotations,
  createdAt = Date.now(),
}) {
  return {
    version: 1,
    type: 'dropple.lesson',

    lessonId,
    runId,

    meta: {
      title,
      description,
      author,
      createdAt,
    },

    timeline: {
      fromEventId,
      toEventId,
      events,
    },

    annotations,

    playback: {
      mode: 'guided',
      defaultSpeed: 800,
      lockCursor: true,
    },
  };
}
