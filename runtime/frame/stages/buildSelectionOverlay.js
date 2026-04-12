export function buildSelectionOverlay(context) {
  const { runtimeState, renderGraph } = context;
  const computedTransforms = runtimeState?.scene?.computed?.transforms ?? {};

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
      x: computedTransforms[node.id]?.x ?? node.transform?.x ?? node.x ?? 0,
      y: computedTransforms[node.id]?.y ?? node.transform?.y ?? node.y ?? 0,
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
