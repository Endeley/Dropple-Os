import { collectInput } from './stages/collectInput.js';
import { processDispatcherQueue } from './stages/processDispatcherQueue.js';
import { evaluateTimeline } from './stages/evaluateTimeline.js';
import { buildRenderGraph } from './stages/buildRenderGraph.js';
import { applySessionPreview } from './stages/applySessionPreview.js';
import { applyPreviewTransforms } from './stages/applyPreviewTransforms.js';
import { applyViewportTransform } from './stages/applyViewportTransform.js';
import { buildSelectionOverlay } from './stages/buildSelectionOverlay.js';

export function runFramePipeline(context) {
  context = collectInput(context);
  context = processDispatcherQueue(context);
  context = evaluateTimeline(context);
  context = buildRenderGraph(context);
  context = applySessionPreview(context);
  context = applyPreviewTransforms(context);
  context = applyViewportTransform(context);
  context = buildSelectionOverlay(context);

  return context;
}

export function runFrame(runtimeState, time = 0, input = {}) {
  const context = {
    runtimeState,
    time,
    input,
  };

  return runFramePipeline(context);
}
