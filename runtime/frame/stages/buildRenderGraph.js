export function buildRenderGraph(context) {
  const nodes = context.runtimeState?.nodes || {};

  const renderGraph = {
    nodes: Object.values(nodes),
  };

  return {
    ...context,
    renderGraph,
  };
}
