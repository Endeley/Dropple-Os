// core/events/reducers/nodeReducers.js

import { EventTypes } from "../eventTypes.js";

export function nodeReducers(state, event) {
  const { type, payload } = event;

  switch (type) {
    case EventTypes.NODE_CREATE: {
      const { node } = payload;
      const nextNode = {
        children: [],
        ...node,
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
          [id]: { ...prev, ...patch },
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
