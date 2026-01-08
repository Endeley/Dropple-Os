export function nodeContentReducer(state, event) {
  const next = structuredClone(state);

  const { nodeId, content } = event.payload;
  const node = next.nodes[nodeId];
  if (!node) return state;

  node.content = content;
  return next;
}
