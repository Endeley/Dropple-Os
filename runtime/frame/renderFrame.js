import { runFrame } from './runFramePipeline.js';
import { renderDesignCanvas } from '@/canvas/render/renderDesignCanvas.js';
import { renderSelectionOverlay, renderSnapGuides } from '@/canvas/render/renderFrame.js';
import { renderGraphToCanvas } from './adapters/renderGraphToCanvas.js';

export function renderFrame({
  runtimeState,
  time = 0,
  input = {},
  canvasContext,
}) {
  const frame = runFrame(runtimeState, time, {
    previewSession: input?.previewSession,
  });

  const renderGraph = frame.renderGraph;

  if (!renderGraph) {
    return frame;
  }

  const canvasNodes = renderGraphToCanvas(renderGraph);

  renderDesignCanvas({
    nodes: canvasNodes,
    ctx: canvasContext,
  });

  renderSelectionOverlay(canvasContext, frame.renderGraph?.selectionOverlay);
  renderSnapGuides(canvasContext, frame.renderGraph?.snapGuides);

  return frame;
}
