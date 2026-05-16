import { runFrame } from './runFramePipeline.js';
import { renderDesignCanvas } from '@/canvas/render/renderDesignCanvas.js';
import { renderSelectionOverlay, renderSnapGuides, renderGuides, renderLayoutSuggestions } from '@/canvas/render/renderFrame.js';
import { renderGraphToCanvas } from './adapters/renderGraphToCanvas.js';
import { createRenderGraphEnvelope } from './renderGraphEnvelope.js';
import { runDeterministicRenderPasses } from './renderPassScheduler.js';

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

  const renderEnvelope = createRenderGraphEnvelope({
    frameTime: time,
    renderGraph,
    passes: [
      { passId: 'design-canvas', order: 0 },
      { passId: 'selection-overlay', order: 1 },
      { passId: 'snap-guides', order: 2 },
      { passId: 'guides', order: 3 },
      { passId: 'layout-suggestions', order: 4 },
    ],
  });
  const passExecution = runDeterministicRenderPasses({
    envelope: renderEnvelope,
    passHandlers: {
      'design-canvas': () =>
        renderDesignCanvas({
          nodes: canvasNodes,
          ctx: canvasContext,
        }),
      'selection-overlay': () => renderSelectionOverlay(canvasContext, frame.renderGraph?.selectionOverlay),
      'snap-guides': () => renderSnapGuides(canvasContext, frame.renderGraph?.snapGuides),
      guides: () => renderGuides(canvasContext, frame.renderGraph?.guides),
      'layout-suggestions': () => renderLayoutSuggestions(canvasContext, frame.renderGraph?.layouts),
    },
  });

  return {
    ...frame,
    renderEnvelope,
    renderPassExecution: passExecution,
  };
}
