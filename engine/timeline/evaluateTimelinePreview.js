import { EventTypes } from '@/core/events/eventTypes.js';
import { attachNode } from '@/core/structure/attachNode.js';
import { detachNode } from '@/core/structure/detachNode.js';
import { reparentNode } from '@/core/structure/reparentNode.js';
import { reorderNode } from '@/core/structure/reorderNode.js';
import { wrapNodes } from '@/core/structure/wrapNodes.js';
import { unwrapNode } from '@/core/structure/unwrapNode.js';

const defaultLayout = Object.freeze({
    mode: 'none',
    gap: 0,
    padding: 0,
    align: 'start',
});

const defaultLayoutChild = Object.freeze({
    grow: 0,
    align: 'start',
    size: 'fixed',
});

/**
 * Pure timeline preview evaluator.
 *
 * Applies reducer-compatible events without importing reducers or dispatcher.
 * Returns a derived state and does not mutate inputs.
 */
export function evaluateTimelinePreview(baseState, events = []) {
    if (!baseState) return baseState;

    const clone =
        typeof structuredClone === 'function'
            ? structuredClone(baseState)
            : JSON.parse(JSON.stringify(baseState));

    let nextState = clone;

    for (const evt of events) {
        nextState = applyPreviewEvent(nextState, evt);
    }

    return nextState;
}

function applyPreviewEvent(state, event) {
    const { type, payload = {} } = event || {};
    if (!type) return state;

    switch (type) {
        case EventTypes.NODE_CREATE: {
            const { node } = payload;
            if (!node?.id) return state;

            const baseNode = {
                children: [],
                ...node,
            };

            const nextNode = {
                ...baseNode,
                layout: { ...defaultLayout, ...(baseNode.layout || {}) },
                layoutChild: {
                    ...defaultLayoutChild,
                    ...(baseNode.layoutChild || {}),
                },
            };

            const nextRootIds = state.rootIds?.includes(node.id)
                ? state.rootIds
                : [...(state.rootIds || []), node.id];

            return {
                ...state,
                nodes: {
                    ...(state.nodes || {}),
                    [node.id]: nextNode,
                },
                rootIds: nextRootIds,
            };
        }

        case EventTypes.NODE_UPDATE: {
            const { id, patch } = payload;
            const prev = state.nodes?.[id];
            if (!prev) return state;

            if (process.env.NODE_ENV !== 'production') {
                if (
                    patch &&
                    ('x' in patch ||
                        'y' in patch ||
                        'width' in patch ||
                        'height' in patch)
                ) {
                    throw new Error(
                        'Invalid NODE_UPDATE: positional fields must live in patch.layout'
                    );
                }
            }

            return {
                ...state,
                nodes: {
                    ...(state.nodes || {}),
                    [id]: {
                        ...prev,
                        layout: {
                            ...defaultLayout,
                            ...(prev.layout || {}),
                            ...(patch?.layout || {}),
                        },
                        layoutChild: {
                            ...defaultLayoutChild,
                            ...(prev.layoutChild || {}),
                            ...(patch?.layoutChild || {}),
                        },
                    },
                },
            };
        }

        case EventTypes.NODE_DELETE: {
            const { id } = payload;
            if (!state.nodes?.[id]) return state;

            const nextNodes = { ...(state.nodes || {}) };
            delete nextNodes[id];

            return {
                ...state,
                nodes: nextNodes,
                rootIds: (state.rootIds || []).filter((rootId) => rootId !== id),
            };
        }

        case EventTypes.NODE_ATTACH: {
            const next = attachNode({
                nodes: state.nodes || {},
                rootIds: state.rootIds || [],
                ...payload,
            });

            return {
                ...state,
                nodes: next.nodes,
                rootIds: next.rootIds,
            };
        }

        case EventTypes.NODE_DETACH: {
            const next = detachNode({
                nodes: state.nodes || {},
                rootIds: state.rootIds || [],
                ...payload,
            });

            return {
                ...state,
                nodes: next.nodes,
                rootIds: next.rootIds,
            };
        }

        case EventTypes.NODE_REPARENT: {
            const next = reparentNode({
                nodes: state.nodes || {},
                rootIds: state.rootIds || [],
                ...payload,
            });

            return {
                ...state,
                nodes: next.nodes,
                rootIds: next.rootIds,
            };
        }

        case EventTypes.NODE_REORDER: {
            return {
                ...state,
                nodes: reorderNode({
                    nodes: state.nodes || {},
                    containerId: payload?.containerId,
                    nodeIds: payload?.nodeIds,
                    nodeId: payload?.nodeId,
                    index: payload?.index,
                }),
            };
        }

        case EventTypes.NODE_WRAP: {
            const next = wrapNodes({
                nodes: state.nodes || {},
                rootIds: state.rootIds || [],
                ...payload,
            });

            return {
                ...state,
                nodes: next.nodes,
                rootIds: next.rootIds,
            };
        }

        case EventTypes.NODE_UNWRAP: {
            const next = unwrapNode({
                nodes: state.nodes || {},
                rootIds: state.rootIds || [],
                ...payload,
            });

            return {
                ...state,
                nodes: next.nodes,
                rootIds: next.rootIds,
            };
        }

        case EventTypes.NODE_MOVE: {
            const { id, xDelta, yDelta } = payload;
            const node = state.nodes?.[id];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return {
                ...state,
                nodes: {
                    ...(state.nodes || {}),
                    [id]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            x: (prevLayout.x ?? 0) + xDelta,
                            y: (prevLayout.y ?? 0) + yDelta,
                        },
                    },
                },
            };
        }

        case EventTypes.NODE_RESIZE: {
            const { id, width, height } = payload;
            const node = state.nodes?.[id];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return {
                ...state,
                nodes: {
                    ...(state.nodes || {}),
                    [id]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            width: width ?? prevLayout.width,
                            height: height ?? prevLayout.height,
                        },
                    },
                },
            };
        }

        case EventTypes.STATE_SET: {
            const { stateId } = payload;
            if (!stateId) return state;
            return {
                ...state,
                activeStateId: stateId,
            };
        }

        case EventTypes.COMPONENT_SET_ACTIVE: {
            const { componentId } = payload;
            if (!componentId) return state;
            return {
                ...state,
                activeComponentId: componentId,
            };
        }

        default:
            return state;
    }
}
