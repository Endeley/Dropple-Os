export function nodeStructureReducer(state, event) {
  const next = structuredClone(state);

  switch (event.type) {
    case 'node.reparent': {
      const { nodeId, newParentId } = event.payload;
      const node = next.nodes[nodeId];
      if (!node) return state;

      if (node.parentId) {
        const oldParent = next.nodes[node.parentId];
        oldParent.children = oldParent.children.filter((id) => id !== nodeId);
      } else {
        next.rootIds = next.rootIds.filter((id) => id !== nodeId);
      }

      if (newParentId) {
        const newParent = next.nodes[newParentId];
        if (!newParent) return state;
        newParent.children.push(nodeId);
        node.parentId = newParentId;
      } else {
        node.parentId = null;
        next.rootIds.push(nodeId);
      }

      return next;
    }

    case 'node.reorder': {
      const { parentId, order } = event.payload;
      const parent = parentId ? next.nodes[parentId] : null;

      if (parent) parent.children = [...order];
      else next.rootIds = [...order];

      return next;
    }

    default:
      return state;
  }
}
