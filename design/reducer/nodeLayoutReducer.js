export function nodeLayoutReducer(state, event) {
  const next = structuredClone(state);

  const { nodeId } = event.payload;
  const node = next.nodes[nodeId];
  if (!node) return state;

  if (event.type === 'node.layout.move') {
    const { x, y } = event.payload;
    node.layout = {
      ...node.layout,
      x,
      y,
    };
  } else if (event.type === 'node.layout.resize') {
    const { width, height } = event.payload;
    node.layout = {
      ...node.layout,
      width,
      height,
    };
  } else {
    const { layout } = event.payload;
    node.layout = {
      ...node.layout,
      ...layout,
    };
  }

  return next;
}
