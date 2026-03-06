import { computeLayoutInference } from '@/engine/layout/computeLayoutInference.js';

export function computeLayoutInferenceStage(context) {
  const renderGraph = context.renderGraph;
  if (!renderGraph?.guides || !renderGraph?.nodes) return context;

  const nodesById = renderGraph.nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});

  const layouts = computeLayoutInference({
    guides: renderGraph.guides,
    nodesById,
  });

  return {
    ...context,
    layouts,
    renderGraph: {
      ...renderGraph,
      layouts,
    },
  };
}
