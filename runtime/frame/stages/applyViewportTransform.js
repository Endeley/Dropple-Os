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

    let previewTransform = node.previewTransform;
    if (previewTransform?.origin) {
      const originScreen = projectToViewport(previewTransform.origin, viewport);
      previewTransform = {
        ...previewTransform,
        originScreen,
      };
    }
    if (previewTransform && (previewTransform.dx || previewTransform.dy)) {
      previewTransform = {
        ...previewTransform,
        dx: (previewTransform.dx ?? 0) * viewport.scale,
        dy: (previewTransform.dy ?? 0) * viewport.scale,
      };
    }

    return {
      ...node,
      screen: projected,
      previewBoundsScreen,
      previewTransform,
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
