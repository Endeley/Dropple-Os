import { evaluateTimeline as evaluatePublicTimeline } from '@/timeline/evaluateTimeline.js';

export function evaluateTimeline(context) {
  const timeline = context.runtimeState?.timeline || null;
  const previewState = timeline
    ? evaluatePublicTimeline({
        timeline,
        time: context.time,
        baseState: context.runtimeState,
      })
    : context.runtimeState;

  const evaluation = {
    timeline,
    time: context.time,
    previewState,
  };

  return {
    ...context,
    timelineEvaluation: evaluation,
  };
}
