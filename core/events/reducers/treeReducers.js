// core/events/reducers/treeReducers.js

import { EventTypes } from "../eventTypes.js";

export function treeReducers(state, event) {
  const { type, payload } = event;

  switch (type) {
      case EventTypes.NODE_ATTACH: {
          const { parentId, childId, childIds, index } = payload;
          const ids = childIds || (childId ? [childId] : []);
          const parent = state.nodes[parentId];
          if (!parent || !ids.length) return state;

          const existing = parent.children || [];
          const filtered = existing.filter((id) => !ids.includes(id));
          const clampedIndex = typeof index === 'number' ? Math.max(0, Math.min(index, filtered.length)) : filtered.length;
          const nextChildren = [
              ...filtered.slice(0, clampedIndex),
              ...ids,
              ...filtered.slice(clampedIndex),
          ];

          const nextNodes = { ...state.nodes, [parentId]: { ...parent, children: nextChildren } };

          ids.forEach((id) => {
              const child = state.nodes[id];
              if (!child) return;
              const prevParentId = child.parentId;
              if (prevParentId && prevParentId !== parentId) {
                  const prevParent = nextNodes[prevParentId];
                  if (prevParent) {
                      const prevChildren = Array.isArray(prevParent.children) ? prevParent.children : [];
                      nextNodes[prevParentId] = {
                          ...prevParent,
                          children: prevChildren.filter((childId) => childId !== id),
                      };
                  }
              }
              nextNodes[id] = { ...child, parentId };
          });

          return {
              ...state,
              nodes: nextNodes,
              rootIds: state.rootIds.filter((id) => !ids.includes(id)),
          };
      }

      case EventTypes.NODE_DETACH: {
          const { ids } = payload || {};
          const detachIds = Array.isArray(ids) ? ids : [];
          if (!detachIds.length) return state;

          const nextNodes = { ...state.nodes };
          const nextRootIds = new Set(state.rootIds || []);

          detachIds.forEach((id) => {
              const child = state.nodes[id];
              if (!child) return;
              const prevParentId = child.parentId;
              if (prevParentId) {
                  const prevParent = nextNodes[prevParentId];
                  if (prevParent) {
                      const prevChildren = Array.isArray(prevParent.children) ? prevParent.children : [];
                      nextNodes[prevParentId] = {
                          ...prevParent,
                          children: prevChildren.filter((childId) => childId !== id),
                      };
                  }
              }

              nextNodes[id] = { ...child, parentId: null };
              nextRootIds.add(id);
          });

          return {
              ...state,
              nodes: nextNodes,
              rootIds: Array.from(nextRootIds),
          };
      }

      case EventTypes.NODE_REORDER: {
          const { containerId, nodeIds, index } = payload;
          const container = state.nodes[containerId];
          if (!container) return state;

          const existing = container.children || [];

          const moving = existing.filter((id) => nodeIds.includes(id));
          const remaining = existing.filter((id) => !nodeIds.includes(id));

          const clampedIndex = Math.max(0, Math.min(index, remaining.length));

          const nextChildren = [
              ...remaining.slice(0, clampedIndex),
              ...moving,
              ...remaining.slice(clampedIndex),
          ];

          return {
              ...state,
              nodes: {
                  ...state.nodes,
                  [containerId]: {
                      ...container,
                      children: nextChildren,
                  },
              },
          };
      }

      case 'node.children.reorder': {
          const { parentId, fromIndex, toIndex } = payload;
          const parent = state.nodes[parentId];
          if (!parent) return state;

          const children = [...(parent.children || [])];
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

          return {
              ...state,
              nodes: {
                  ...state.nodes,
                  [parentId]: {
                      ...parent,
                      children,
                  },
              },
          };
      }

      default:
          return state;
  }
}
