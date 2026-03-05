export function applyPreviewTransforms(context) {
  const renderGraph = context.renderGraph;
  const preview = context.input?.previewSession;

  if (!renderGraph || !preview) {
    return context;
  }

  const { hitNodeId, previewDelta } = preview;

  if (!hitNodeId) {
    return context;
  }

  const nodes = renderGraph.nodes || [];

  const updatedNodes = nodes.map((node) => {
    if (node.id !== hitNodeId) {
      return node;
    }

    const dx = previewDelta?.dx || 0;
    const dy = previewDelta?.dy || 0;

    return {
      ...node,
      previewTransform: {
        dx,
        dy,
      },
    };
  });

  return {
    ...context,
    renderGraph: {
      ...renderGraph,
      nodes: updatedNodes,
    },
  };
}
