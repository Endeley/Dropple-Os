import { createLessonExport } from './LessonSchema.js';
import { selectLessonRange } from './selectLessonRange.js';
import { createDesignState } from '../../design/state/createDesignState.js';
import { designReducer } from '../../design/reducer/designReducer.js';

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
    const replay = (index) => {
      let state = createDesignState();
      for (let i = 0; i <= index; i += 1) {
        state = designReducer(state, lessonEvents[i]);
      }
      return state;
    };

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
