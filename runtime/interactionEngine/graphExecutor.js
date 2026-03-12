export function executeGraph(graph, context = {}) {
  if (!graph || typeof graph.getNodes !== 'function') {
    return {};
  }

  const nodes = graph.getNodes();
  const result = {};

  for (const node of nodes) {
    const output = node?.evaluate?.(context, result);
    if (output) {
      Object.assign(result, output);
    }
  }

  return result;
}
