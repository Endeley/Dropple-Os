export function renderGraphToCanvas(renderGraph) {
  const nodes = renderGraph.nodes || [];

  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    props: node.props || {},
    previewTransform: node.previewTransform,
    screen: node.screen,
  }));
}
