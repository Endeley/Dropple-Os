import { EventTypes } from '@/core/events/eventTypes.js';

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
            const { parentId, childId, childIds, index } = payload;
            const ids = childIds || (childId ? [childId] : []);
            const parent = state.nodes?.[parentId];
            if (!parent || !ids.length) return state;

            const existing = parent.children || [];
            const filtered = existing.filter((id) => !ids.includes(id));
            const clampedIndex =
                typeof index === 'number'
                    ? Math.max(0, Math.min(index, filtered.length))
                    : filtered.length;
            const nextChildren = [
                ...filtered.slice(0, clampedIndex),
                ...ids,
                ...filtered.slice(clampedIndex),
            ];

            const nextNodes = {
                ...(state.nodes || {}),
                [parentId]: { ...parent, children: nextChildren },
            };

            ids.forEach((id) => {
                const child = state.nodes?.[id];
                if (!child) return;
                nextNodes[id] = { ...child, parentId };
            });

            return {
                ...state,
                nodes: nextNodes,
                rootIds: (state.rootIds || []).filter((id) => !ids.includes(id)),
            };
        }

        case EventTypes.NODE_REORDER: {
            const { containerId, nodeIds = [], index } = payload;
            const container = state.nodes?.[containerId];
            if (!container) return state;

            const existing = container.children || [];
            const moving = existing.filter((id) => nodeIds.includes(id));
            const remaining = existing.filter((id) => !nodeIds.includes(id));
            const clampedIndex = Math.max(0, Math.min(index ?? 0, remaining.length));
            const nextChildren = [
                ...remaining.slice(0, clampedIndex),
                ...moving,
                ...remaining.slice(clampedIndex),
            ];

            return {
                ...state,
                nodes: {
                    ...(state.nodes || {}),
                    [containerId]: {
                        ...container,
                        children: nextChildren,
                    },
                },
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
