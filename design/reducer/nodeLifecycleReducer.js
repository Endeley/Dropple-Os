import { createNode } from '../state/createNode.js';

export function nodeLifecycleReducer(state, event) {
  const next = structuredClone(state);

  switch (event.type) {
    case 'node.create': {
      const { nodeId, nodeType, parentId, initialProps } = event.payload;

      if (next.nodes[nodeId]) return state;

      const node = createNode({
        id: nodeId,
        type: nodeType,
        parentId,
        props: initialProps || {},
      });

      next.nodes[nodeId] = node;

      if (parentId) {
        const parent = next.nodes[parentId];
        if (!parent) return state;
        parent.children.push(nodeId);
      } else {
        next.rootIds.push(nodeId);
      }

      return next;
    }

    case 'node.delete': {
      const { nodeId } = event.payload;
      if (!next.nodes[nodeId]) return state;

      removeSubtree(next, nodeId);
      return next;
    }

    default:
      return state;
  }
}

function removeSubtree(state, nodeId) {
  const node = state.nodes[nodeId];
  if (!node) return;

  node.children.forEach((childId) => removeSubtree(state, childId));

  if (node.parentId) {
    const parent = state.nodes[node.parentId];
    parent.children = parent.children.filter((id) => id !== nodeId);
  } else {
    state.rootIds = state.rootIds.filter((id) => id !== nodeId);
  }

  delete state.nodes[nodeId];
}
