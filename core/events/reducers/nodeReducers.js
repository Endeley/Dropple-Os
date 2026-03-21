// core/events/reducers/nodeReducers.js

import { EventTypes } from "../eventTypes.js";
import { markLayoutDirty } from "./layoutDirtyHelpers.js";

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

function normalizeAngle(angle) {
  const TAU = Math.PI * 2;
  let a = angle;
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
}

function getSceneGraph(state) {
  const documentGraph = state?.document?.sceneGraph;
  return {
    nodes: documentGraph?.nodes ?? state?.nodes ?? {},
    rootIds: documentGraph?.rootIds ?? state?.rootIds ?? [],
  };
}

function applySceneGraph(state, nextGraph) {
  const document = state?.document
    ? {
        ...state.document,
        sceneGraph: nextGraph,
      }
    : state?.document;

  return {
    ...state,
    document,
    nodes: nextGraph.nodes,
    rootIds: nextGraph.rootIds,
  };
}

export function nodeReducers(state, event) {
  const { type, payload } = event;
  const graph = getSceneGraph(state);

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

      const nextRootIds = graph.rootIds.includes(node.id)
        ? graph.rootIds
        : [...graph.rootIds, node.id];

      const nextState = applySceneGraph(state, {
        nodes: {
          ...graph.nodes,
          [node.id]: nextNode,
        },
        rootIds: nextRootIds,
      });
      return markLayoutDirty(nextState, {
        nodeIds: [node.id],
      });
    }

    case EventTypes.NODE_UPDATE: {
      const { id, patch } = payload;
      const prev = graph.nodes[id];
      if (!prev) return state;

      if (process.env.NODE_ENV !== 'production') {
        if ('x' in patch || 'y' in patch || 'width' in patch || 'height' in patch) {
          throw new Error(
            'Invalid NODE_UPDATE: positional fields must live in patch.layout'
          );
        }
      }

      return applySceneGraph(state, {
        nodes: {
          ...graph.nodes,
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
        rootIds: graph.rootIds,
      });
    }

    case EventTypes.NODE_DELETE: {
      const { id } = payload;
      if (!graph.nodes[id]) return state;

      const nextNodes = { ...graph.nodes };
      delete nextNodes[id];

      const nextState = applySceneGraph(state, {
        nodes: nextNodes,
        rootIds: graph.rootIds.filter((rootId) => rootId !== id),
      });
      return markLayoutDirty(nextState, {
        nodeIds: [id],
      });
    }

    case 'node.content.update':
    case 'text.content.update':
    case 'image.source.update': {
      const { nodeId, content } = payload;
      const prev = graph.nodes[nodeId];
      if (!prev) return state;

      const nextState = applySceneGraph(state, {
        nodes: {
          ...graph.nodes,
          [nodeId]: {
            ...prev,
            content,
          },
        },
        rootIds: graph.rootIds,
      });
      return markLayoutDirty(nextState, {
        nodeIds: [nodeId],
      });
    }

    case 'node.props.update': {
      const { nodeId, props } = payload;
      const prev = graph.nodes[nodeId];
      if (!prev) return state;

      return applySceneGraph(state, {
        nodes: {
          ...graph.nodes,
          [nodeId]: {
            ...prev,
            props: {
              ...(prev.props || {}),
              ...(props || {}),
            },
          },
        },
        rootIds: graph.rootIds,
      });
    }

    case EventTypes.NODE_ROTATE: {
      const { nodeIds, rotation } = payload;
      if (!Array.isArray(nodeIds) || nodeIds.length === 0) return state;
      const delta = rotation ?? 0;

      const nextNodes = { ...graph.nodes };
      nodeIds.forEach((id) => {
        const prev = nextNodes[id];
        if (!prev) return;
        const nextRotation = normalizeAngle((prev.rotation ?? 0) + delta);
        nextNodes[id] = {
          ...prev,
          rotation: nextRotation,
        };
      });

      return applySceneGraph(state, {
        nodes: nextNodes,
        rootIds: graph.rootIds,
      });
    }

    case 'node.layout.rotate': {
      const { nodeId, rotation } = payload;
      const prev = graph.nodes[nodeId];
      if (!prev) return state;

      return applySceneGraph(state, {
        nodes: {
          ...graph.nodes,
          [nodeId]: {
            ...prev,
            rotation: normalizeAngle(rotation ?? prev.rotation ?? 0),
          },
        },
        rootIds: graph.rootIds,
      });
    }

    default:
      return state;
  }
}
