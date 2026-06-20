// core/events/reducers/nodeReducers.js

import { EventTypes } from "../eventTypes.js";
import { NodeMutationTypes } from "../nodeMutationTypes.js";
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

function extractLayoutEntry(node = {}) {
  const transform = node?.props?.transform ?? node?.transform ?? {};
  const layout = node?.layout ?? {};

  return {
    ...defaultLayout,
    ...layout,
    x: layout.x ?? node?.x ?? transform.x ?? 0,
    y: layout.y ?? node?.y ?? transform.y ?? 0,
    width: layout.width ?? node?.width ?? transform.width,
    height: layout.height ?? node?.height ?? transform.height,
  };
}

function stripLayoutFromNode(node = {}) {
  const {
    layout: _layout,
    x: _x,
    y: _y,
    width: _width,
    height: _height,
    ...rest
  } = node;

  return rest;
}

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
    nodes: documentGraph?.nodes ?? {},
    rootIds: documentGraph?.rootIds ?? [],
  };
}

function collectNodeSubtreeIds(nodes, nodeId, visited = new Set()) {
  if (!nodeId || visited.has(nodeId) || !nodes[nodeId]) return visited;

  visited.add(nodeId);

  const children = Array.isArray(nodes[nodeId]?.children) ? nodes[nodeId].children : [];
  children.forEach((childId) => {
    collectNodeSubtreeIds(nodes, childId, visited);
  });

  return visited;
}

function applySceneGraph(state, nextGraph) {
  return applyDocumentSlices(state, {
    sceneGraph: nextGraph,
  });
}

function applyDocumentSlices(state, slices) {
  const document = state?.document
    ? {
        ...state.document,
        ...slices,
      }
    : state?.document;

  return {
    ...state,
    document,
  };
}

function resolveFirstRememberedArtifact(state) {
  return state?.document?.world?.history?.firstRememberedArtifact ?? null;
}

function createFirstRememberedArtifactEntry(node = {}) {
  return {
    nodeId: node?.id ?? null,
    nodeType: node?.type ?? null,
    parentId: node?.parentId ?? null,
    layout: extractLayoutEntry(node),
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
      const nextLayoutEntry = extractLayoutEntry(baseNode);

      const nextNode = {
        ...stripLayoutFromNode(baseNode),
        layoutChild: { ...defaultLayoutChild, ...(baseNode.layoutChild || {}) },
      };

      const parentId = nextNode.parentId ?? null;
      const parentNode = parentId ? graph.nodes[parentId] : null;
      const nextNodes = {
        ...graph.nodes,
        [node.id]: nextNode,
      };

      if (parentNode) {
        const parentChildren = Array.isArray(parentNode.children)
          ? parentNode.children
          : [];
        nextNodes[parentId] = {
          ...parentNode,
          children: parentChildren.includes(node.id)
            ? parentChildren
            : [...parentChildren, node.id],
        };
      }

      const nextRootIds = parentNode
        ? graph.rootIds.filter((rootId) => rootId !== node.id)
        : (graph.rootIds.includes(node.id)
            ? graph.rootIds
            : [...graph.rootIds, node.id]);

      const nextState = applyDocumentSlices(state, {
        sceneGraph: {
          nodes: nextNodes,
          rootIds: nextRootIds,
        },
        layout: {
          ...(state?.document?.layout ?? {}),
          nodes: {
            ...(state?.document?.layout?.nodes ?? {}),
            [node.id]: nextLayoutEntry,
          },
        },
        world: {
          ...(state?.document?.world ?? {}),
          history: {
            ...(state?.document?.world?.history ?? {}),
            firstRememberedArtifact:
              resolveFirstRememberedArtifact(state) ?? createFirstRememberedArtifactEntry(baseNode),
          },
        },
      });
      return markLayoutDirty(nextState, {
        nodeIds: parentNode ? [parentId, node.id] : [node.id],
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

      const nextState = applyDocumentSlices(state, {
        sceneGraph: {
          nodes: {
            ...graph.nodes,
            [id]: {
              ...prev,
              layoutChild: {
                ...defaultLayoutChild,
                ...(prev.layoutChild || {}),
                ...(patch.layoutChild || {}),
              },
            },
          },
          rootIds: graph.rootIds,
        },
        layout: patch.layout
          ? {
              ...(state?.document?.layout ?? {}),
              nodes: {
                ...(state?.document?.layout?.nodes ?? {}),
                [id]: {
                  ...extractLayoutEntry(prev),
                  ...(state?.document?.layout?.nodes?.[id] ?? {}),
                  ...(patch.layout || {}),
                },
              },
            }
          : state?.document?.layout,
      });

      return patch.layout
        ? markLayoutDirty(nextState, { nodeIds: [id] })
        : nextState;
    }

    case EventTypes.NODE_DELETE: {
      const { id } = payload;
      const target = graph.nodes[id];
      if (!target) return state;

      const removedIds = Array.from(collectNodeSubtreeIds(graph.nodes, id));

      const nextNodes = { ...graph.nodes };
      removedIds.forEach((nodeId) => {
        delete nextNodes[nodeId];
      });

      const parentId = target.parentId ?? null;
      if (parentId && nextNodes[parentId]) {
        nextNodes[parentId] = {
          ...nextNodes[parentId],
          children: (nextNodes[parentId].children ?? []).filter((childId) => !removedIds.includes(childId)),
        };
      }

      const nextLayoutNodes = { ...(state?.document?.layout?.nodes ?? {}) };
      const nextComputed = { ...(state?.document?.layout?.computed ?? {}) };
      removedIds.forEach((nodeId) => {
        delete nextLayoutNodes[nodeId];
        delete nextComputed[nodeId];
      });

      const nextState = applyDocumentSlices(state, {
        sceneGraph: {
          nodes: nextNodes,
          rootIds: graph.rootIds.filter((rootId) => !removedIds.includes(rootId)),
        },
        layout: {
          ...(state?.document?.layout ?? {}),
          nodes: nextLayoutNodes,
          computed: nextComputed,
        },
      });
      return markLayoutDirty(nextState, {
        nodeIds: [parentId, ...removedIds].filter(Boolean),
      });
    }

    case NodeMutationTypes.CONTENT_UPDATE:
    case NodeMutationTypes.TEXT_CONTENT_UPDATE:
    case NodeMutationTypes.IMAGE_SOURCE_UPDATE: {
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

    case NodeMutationTypes.PROPS_UPDATE: {
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

    case NodeMutationTypes.LAYOUT_ROTATE: {
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
