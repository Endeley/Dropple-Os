// 🔒 Canonical node factory import (sovereign path).
import { createNode } from '@/core/nodes/createNode';
import { normalizeNodeShape } from '../state/normalizeNodeShape.js';

// Legacy design reducer stack.
// Active WorldShell / Create > UI mutations flow through the runtime dispatcher
// and core/events/reducers/* using canonical slash event types.

export function nodeLifecycleReducer(state, event) {
  const next = structuredClone(state);

  switch (event.type) {
    case 'node.create': {
      const payloadNode = event.payload?.node;
      if (payloadNode) {
        if (next.nodes[payloadNode.id]) return state;

        const normalized = normalizeNodeShape(payloadNode);
        const node = createNode(normalized);

        next.nodes[node.id] = node;

        if (node.parentId) {
          const parent = next.nodes[node.parentId];
          if (!parent) return state;
          parent.children.push(node.id);
        } else {
          next.rootIds.push(node.id);
        }

        return next;
      }

      const { nodeId, nodeType, parentId, initialProps, layout } = event.payload;

      if (next.nodes[nodeId]) return state;

      const node = createNode(
        normalizeNodeShape({
        id: nodeId,
        type: nodeType,
        parentId,
        props: initialProps || {},
        layout: layout || {},
        }),
      );

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

    case 'node.children.reorder': {
      const { parentId, fromIndex, toIndex } = event.payload;
      const parent = next.nodes[parentId];
      if (!parent) return state;

      const children = [...parent.children];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= children.length ||
        toIndex >= children.length
      ) {
        return state;
      }

      const [moved] = children.splice(fromIndex, 1);
      children.splice(toIndex, 0, moved);

      parent.children = children;
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
