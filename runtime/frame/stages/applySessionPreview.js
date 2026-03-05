export function applySessionPreview(context) {
  const renderGraph = context.renderGraph;
  const preview = context.input?.sessionPreview;

  if (!renderGraph || !preview) {
    return context;
  }

  const nodes = renderGraph.nodes || [];

  if (preview.kind === 'resize' && preview.nodeId && preview.previewBoundsWorld) {
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

  if (preview.kind === 'rotate' && Array.isArray(preview.nodeIds)) {
    const updatedNodes = nodes.map((node) => {
      if (!preview.nodeIds.includes(node.id)) return node;
      const nextPreview = {
        ...(node.previewTransform || {}),
        rotation: preview.rotationDelta,
        origin: preview.centerWorld,
      };
      return {
        ...node,
        previewTransform: nextPreview,
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

  return {
    ...context,
    renderGraph: {
      ...renderGraph,
      nodes,
    },
  };
}
