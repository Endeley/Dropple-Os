export function serializeSelection({ state, selectedIds }) {
  const nodes = [];
  const rootIds = [];

  selectedIds.forEach((id) => {
    const node = state.nodes[id];
    if (!node) return;

    nodes.push(structuredClone(node));

    if (!node.parentId || !selectedIds.has(node.parentId)) {
      rootIds.push(id);
    }
  });

  return { nodes, rootIds };
}
