export function nodeStyleReducer(state, event) {
  const next = structuredClone(state);

  const { nodeId, style } = event.payload;
  const node = next.nodes[nodeId];
  if (!node) return state;

  node.style = {
    ...node.style,
    ...style,
  };

  return next;
}
