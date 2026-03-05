export function evaluateTimeline(context) {
  const timeline = context.runtimeState?.timeline || null;

  const evaluation = {
    timeline,
    time: context.time,
  };

  return {
    ...context,
    timelineEvaluation: evaluation,
  };
}
