import { projectToViewport } from '@/canvas/transform/projectToViewport.js';

export function applyViewportTransform(context) {
  const renderGraph = context.renderGraph;
  const viewport = context.runtimeState?.workspace?.viewport;

  if (!renderGraph || !viewport) {
    return context;
  }

  const nodes = renderGraph.nodes || [];

  const projectedNodes = nodes.map((node) => {
    const projected = projectToViewport(node, viewport);

    return {
      ...node,
      screen: projected,
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
