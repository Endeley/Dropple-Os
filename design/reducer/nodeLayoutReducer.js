export function nodeLayoutReducer(state, event) {
  const next = structuredClone(state);

  const { nodeId, layout } = event.payload;
  const node = next.nodes[nodeId];
  if (!node) return state;

  node.layout = {
    ...node.layout,
    ...layout,
  };

  return next;
}
