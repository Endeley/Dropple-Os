import { EventTypes } from '../eventTypes.js';
import { attachNode } from '@/core/structure/attachNode.js';
import { detachNode } from '@/core/structure/detachNode.js';
import { reparentNode } from '@/core/structure/reparentNode.js';
import { reorderNode } from '@/core/structure/reorderNode.js';

export function nodeStructureReducers(state, event) {
    const { type, payload } = event;

    switch (type) {
        case EventTypes.NODE_ATTACH: {
            const next = attachNode({
                nodes: state.nodes,
                rootIds: state.rootIds,
                ...payload,
            });

            if (next.nodes === state.nodes && next.rootIds === state.rootIds) {
                return state;
            }

            return {
                ...state,
                nodes: next.nodes,
                rootIds: next.rootIds,
            };
        }

        case EventTypes.NODE_DETACH: {
            const next = detachNode({
                nodes: state.nodes,
                rootIds: state.rootIds,
                ...payload,
            });

            if (next.nodes === state.nodes && next.rootIds === state.rootIds) {
                return state;
            }

            return {
                ...state,
                nodes: next.nodes,
                rootIds: next.rootIds,
            };
        }

        case EventTypes.NODE_REPARENT: {
            const next = reparentNode({
                nodes: state.nodes,
                rootIds: state.rootIds,
                ...payload,
            });

            if (next.nodes === state.nodes && next.rootIds === state.rootIds) {
                return state;
            }

            return {
                ...state,
                nodes: next.nodes,
                rootIds: next.rootIds,
            };
        }

        case EventTypes.NODE_REORDER: {
            const nextNodes = reorderNode({
                nodes: state.nodes,
                containerId: payload?.containerId,
                nodeIds: payload?.nodeIds,
                nodeId: payload?.nodeId,
                index: payload?.index,
            });

            if (nextNodes === state.nodes) {
                return state;
            }

            return {
                ...state,
                nodes: nextNodes,
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
