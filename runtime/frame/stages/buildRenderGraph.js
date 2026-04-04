import { getNodes } from '@/runtime/document/documentAdapter.js';

export function buildRenderGraph(context) {
  const nodes = getNodes(context.runtimeState);

  const renderGraph = {
    nodes: Object.values(nodes),
  };

  return {
    ...context,
    renderGraph,
  };
}
