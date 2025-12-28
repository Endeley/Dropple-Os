// core/events/reducers/treeReducers.js

import { EventTypes } from "../eventTypes.js";

export function treeReducers(state, event) {
  const { type, payload } = event;

  switch (type) {
      case EventTypes.NODE_ATTACH: {
          const { parentId, childId } = payload;
          const parent = state.nodes[parentId];
          const child = state.nodes[childId];
          if (!parent || !child) return state;

          const parentChildren = parent.children || [];
          const nextChildren = parentChildren.includes(childId) ? parentChildren : [...parentChildren, childId];

          return {
              ...state,
              nodes: {
                  ...state.nodes,
                  [parentId]: {
                      ...parent,
                      children: nextChildren,
                  },
                  [childId]: {
                      ...child,
                      parentId,
                  },
              },
              rootIds: state.rootIds.filter((id) => id !== childId),
          };
      }

      case EventTypes.NODE_ATTACH: {
          const { parentId, childId } = payload;
          const parent = state.nodes[parentId];
          const child = state.nodes[childId];
          if (!parent || !child) return state;
          if (child.parentId === parentId) return state;

          return {
              ...state,
              nodes: {
                  ...state.nodes,
                  [parent.id]: {
                      ...parent,
                      children: (parent.children || []).filter((id) => id !== childId),
                  },
                  [childId]: {
                      ...child,
                      parentId: null,
                  },
              },
              rootIds: state.rootIds.includes(childId) ? state.rootIds : [...state.rootIds, childId],
          };
      }

      default:
          return state;
  }
}
