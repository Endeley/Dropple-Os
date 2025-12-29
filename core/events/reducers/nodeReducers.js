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

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [id]: {
            ...prev,
            ...patch,
            layout: { ...defaultLayout, ...(prev.layout || {}), ...(patch.layout || {}) },
            layoutChild: { ...defaultLayoutChild, ...(prev.layoutChild || {}), ...(patch.layoutChild || {}) },
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

    default:
      return state;
  }
}
