export function applySessionPreview(context) {
  const renderGraph = context.renderGraph;
  const preview = context.input?.sessionPreview;

  if (!renderGraph || !preview) {
    return context;
  }

  if (preview.kind !== 'resize' || !preview.nodeId || !preview.previewBoundsWorld) {
    return context;
  }

  const nodes = renderGraph.nodes || [];

  const updatedNodes = nodes.map((node) => {
    if (node.id !== preview.nodeId) return node;
    return {
      ...node,
      previewBounds: preview.previewBoundsWorld,
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
