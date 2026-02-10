// core/events/reducers/nodeReducers.js

import { EventTypes } from "../eventTypes.js";

const defaultLayout = Object.freeze({
  mode: "none",
  gap: 0,
  padding: 0,
  align: "start",
});

const defaultLayoutChild = Object.freeze({
  grow: 0,
  align: "start",
  size: "fixed", // 'fixed' | 'fill' | 'hug'
});

export function nodeReducers(state, event) {
  const { type, payload } = event;

  switch (type) {
    case EventTypes.NODE_CREATE: {
      console.log('[nodeReducers] received NODE_CREATE:', event);
      const { node } = payload;
      const baseNode = {
        children: [],
        ...node,
      };

      const nextNode = {
        ...baseNode,
        layout: { ...defaultLayout, ...(baseNode.layout || {}) },
        layoutChild: { ...defaultLayoutChild, ...(baseNode.layoutChild || {}) },
      };

      const nextRootIds = state.rootIds.includes(node.id)
        ? state.rootIds
        : [...state.rootIds, node.id];

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [node.id]: nextNode,
        },
        rootIds: nextRootIds,
      };
    }

    case EventTypes.NODE_UPDATE: {
      const { id, patch } = payload;
      const prev = state.nodes[id];
      if (!prev) return state;

      if (process.env.NODE_ENV !== 'production') {
        if ('x' in patch || 'y' in patch || 'width' in patch || 'height' in patch) {
          throw new Error(
            'Invalid NODE_UPDATE: positional fields must live in patch.layout'
          );
        }
      }

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [id]: {
            ...prev,

            // 🔒 ONLY layout & layoutChild may be updated
            layout: {
              ...defaultLayout,
              ...(prev.layout || {}),
              ...(patch.layout || {}),
            },

            layoutChild: {
              ...defaultLayoutChild,
              ...(prev.layoutChild || {}),
              ...(patch.layoutChild || {}),
            },
          },
        },
      };
    }

    case EventTypes.NODE_DELETE: {
      const { id } = payload;
      if (!state.nodes[id]) return state;

      const nextNodes = { ...state.nodes };
      delete nextNodes[id];

      return {
        ...state,
        nodes: nextNodes,
        rootIds: state.rootIds.filter((rootId) => rootId !== id),
      };
    }

    case 'node.content.update':
    case 'text.content.update':
    case 'image.source.update': {
      const { nodeId, content } = payload;
      const prev = state.nodes[nodeId];
      if (!prev) return state;

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [nodeId]: {
            ...prev,
            content,
          },
        },
      };
    }

    case 'node.props.update': {
      const { nodeId, props } = payload;
      const prev = state.nodes[nodeId];
      if (!prev) return state;

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [nodeId]: {
            ...prev,
            props: {
              ...(prev.props || {}),
              ...(props || {}),
            },
          },
        },
      };
    }

    default:
      return state;
  }
}
