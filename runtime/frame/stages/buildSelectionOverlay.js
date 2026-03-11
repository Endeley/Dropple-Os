export function buildSelectionOverlay(context) {
  const { runtimeState, renderGraph } = context;

  const ids = Array.from(runtimeState.selection?.ids ?? []);

  if (!ids.length) {
    return context;
  }

  const nodes = renderGraph.nodes || [];

  const selectedNodes = nodes.filter((n) => ids.includes(n.id));

  const overlay = selectedNodes.map((node) => ({
    type: 'selection-box',
    id: node.id,
    bounds: node.bounds || {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
    },
  }));

  return {
    ...context,
    renderGraph: {
      ...renderGraph,
      selectionOverlay: overlay,
    },
  };
}
