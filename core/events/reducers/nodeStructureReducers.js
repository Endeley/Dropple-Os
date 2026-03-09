import { EventTypes } from '../eventTypes.js';
import { attachNode } from '@/core/structure/attachNode.js';
import { detachNode } from '@/core/structure/detachNode.js';
import { reparentNode } from '@/core/structure/reparentNode.js';
import { reorderNode } from '@/core/structure/reorderNode.js';
import { wrapNodes } from '@/core/structure/wrapNodes.js';
import { unwrapNode } from '@/core/structure/unwrapNode.js';
import { markLayoutDirty } from './layoutDirtyHelpers.js';

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

export function nodeStructureReducers(state, event) {
    const { type, payload } = event;
    const graph = getSceneGraph(state);

    switch (type) {
        case EventTypes.NODE_ATTACH: {
            const next = attachNode({
                nodes: graph.nodes,
                rootIds: graph.rootIds,
                ...payload,
            });

            if (next.nodes === graph.nodes && next.rootIds === graph.rootIds) {
                return state;
            }

            return markLayoutDirty(applySceneGraph(state, next), {
                nodeIds: [
                    payload?.parentId,
                    ...(payload?.childIds ?? payload?.nodeIds ?? [payload?.childId ?? payload?.nodeId]),
                ],
            });
        }

        case EventTypes.NODE_DETACH: {
            const next = detachNode({
                nodes: graph.nodes,
                rootIds: graph.rootIds,
                ...payload,
            });

            if (next.nodes === graph.nodes && next.rootIds === graph.rootIds) {
                return state;
            }

            return markLayoutDirty(applySceneGraph(state, next), {
                nodeIds: payload?.ids ?? payload?.nodeIds ?? [payload?.nodeId],
            });
        }

        case EventTypes.NODE_REPARENT: {
            const next = reparentNode({
                nodes: graph.nodes,
                rootIds: graph.rootIds,
                ...payload,
            });

            if (next.nodes === graph.nodes && next.rootIds === graph.rootIds) {
                return state;
            }

            return markLayoutDirty(applySceneGraph(state, next), {
                nodeIds: [
                    payload?.parentId,
                    ...(payload?.nodeIds ?? [payload?.nodeId]),
                ],
            });
        }

        case EventTypes.NODE_REORDER: {
            const nextNodes = reorderNode({
                nodes: graph.nodes,
                containerId: payload?.containerId,
                nodeIds: payload?.nodeIds,
                nodeId: payload?.nodeId,
                index: payload?.index,
            });

            if (nextNodes === graph.nodes) {
                return state;
            }

            return markLayoutDirty(applySceneGraph(state, {
                nodes: nextNodes,
                rootIds: graph.rootIds,
            }), {
                nodeIds: [
                    payload?.containerId,
                    ...(payload?.nodeIds ?? [payload?.nodeId]),
                ],
            });
        }

        case EventTypes.NODE_WRAP: {
            const next = wrapNodes({
                nodes: graph.nodes,
                rootIds: graph.rootIds,
                ...payload,
            });

            if (next.nodes === graph.nodes && next.rootIds === graph.rootIds) {
                return state;
            }

            return markLayoutDirty(applySceneGraph(state, next), {
                nodeIds: [
                    payload?.parentId,
                    payload?.wrapperNode?.id,
                    ...(payload?.nodeIds ?? []),
                ],
            });
        }

        case EventTypes.NODE_UNWRAP: {
            const next = unwrapNode({
                nodes: graph.nodes,
                rootIds: graph.rootIds,
                ...payload,
            });

            if (next.nodes === graph.nodes && next.rootIds === graph.rootIds) {
                return state;
            }

            const wrapperNode = graph.nodes[payload?.nodeId];
            return markLayoutDirty(applySceneGraph(state, next), {
                nodeIds: [
                    payload?.nodeId,
                    wrapperNode?.parentId,
                    ...(wrapperNode?.children ?? []),
                ],
            });
        }

        case 'node.children.reorder': {
            const { parentId, fromIndex, toIndex } = payload;
            const parent = graph.nodes[parentId];
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

            return markLayoutDirty(applySceneGraph(state, {
                nodes: {
                    ...graph.nodes,
                    [parentId]: {
                        ...parent,
                        children,
                    },
                },
                rootIds: graph.rootIds,
            }), {
                nodeIds: [parentId],
            });
        }

        default:
            return state;
    }
}
