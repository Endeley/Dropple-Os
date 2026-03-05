export function createFrameContext({
  runtimeState,
  time = 0,
  input = {},
}) {
  return {
    frameId: 0,

    input,

    time,

    runtimeState,

    intentPreview: null,

    timelineEvaluation: null,

    renderGraph: null,
  };
}
