import { projectToViewport } from '@/canvas/transform/projectToViewport.js';
import { projectRectToViewport } from '@/canvas/transform/projectRectToViewport.js';

export function applyViewportTransform(context) {
  const renderGraph = context.renderGraph;
  const viewport = context.runtimeState?.workspace?.viewport;

  if (!renderGraph || !viewport) {
    return context;
  }

  const nodes = renderGraph.nodes || [];

  const projectedNodes = nodes.map((node) => {
    const projected = projectToViewport(node, viewport);
    const previewBoundsScreen = node.previewBounds
      ? projectRectToViewport(node.previewBounds, viewport)
      : null;

    return {
      ...node,
      screen: projected,
      previewBoundsScreen,
    };
  });

  return {
    ...context,
    renderGraph: {
      ...renderGraph,
      nodes: projectedNodes,
    },
  };
}
