import { createLessonExport } from './LessonSchema.js';
import { selectLessonRange } from './selectLessonRange.js';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';

export async function exportLesson({
  runId,
  title,
  description,
  author,
  fromEventId,
  toEventId,
  events,
  annotationStore,
  agent = null,
  options = {},
}) {
  const lessonEvents = selectLessonRange(events, fromEventId, toEventId);
  const annotations = annotationStore.annotations.filter((a) =>
    lessonEvents.some((e) => e.id === a.eventId)
  );

  const meta = {
    title,
    description,
    author,
  };

  if (options.includeAI && agent) {
    const replay = (index) =>
      replayEvents({
        events: lessonEvents.slice(0, index + 1),
      });

    for (let i = 1; i < lessonEvents.length; i += 1) {
      await agent.observeStep({
        event: lessonEvents[i],
        prevState: replay(i - 1),
        nextState: replay(i),
        lessonContext: meta,
      });
    }
  }

  return createLessonExport({
    lessonId: crypto.randomUUID(),
    runId,
    title,
    description,
    author,
    fromEventId,
    toEventId,
    events: lessonEvents,
    annotations,
  });
}
