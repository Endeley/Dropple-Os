// core/events/reducers/layoutReducers.js

import { EventTypes } from '../eventTypes.js';
import { markLayoutDirty } from './layoutDirtyHelpers.js';

export function layoutReducers(state, event) {
    const { type, payload } = event;

    switch (type) {
        case EventTypes.NODE_MOVE: {
            const { id, xDelta, yDelta } = payload;
            const node = state.nodes[id];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return markLayoutDirty({
                ...state,
                nodes: {
                    ...state.nodes,
                    [id]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            x: (prevLayout.x ?? 0) + xDelta,
                            y: (prevLayout.y ?? 0) + yDelta,
                        },
                    },
                },
            }, {
                nodeIds: [id],
            });
        }

        case 'node.layout.move': {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[DEPRECATED] node.layout.move -> use node.layout.bulk');
            }

            const { nodeId, x, y } = payload;

            return layoutReducers(state, {
                type: 'node.layout.bulk',
                payload: {
                    updates: [{ id: nodeId, x, y }],
                },
            });
        }

        case EventTypes.NODE_RESIZE: {
            const { id, width, height } = payload;
            const node = state.nodes[id];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return markLayoutDirty({
                ...state,
                nodes: {
                    ...state.nodes,
                    [id]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            width: width ?? prevLayout.width,
                            height: height ?? prevLayout.height,
                        },
                    },
                },
            }, {
                nodeIds: [id],
            });
        }

        case 'node.layout.resize': {
            const { nodeId, x, y, width, height } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return markLayoutDirty({
                ...state,
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            x: x ?? prevLayout.x,
                            y: y ?? prevLayout.y,
                            width: width ?? prevLayout.width,
                            height: height ?? prevLayout.height,
                        },
                    },
                },
            }, {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.update': {
            const { nodeId, layout } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return markLayoutDirty({
                ...state,
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            ...(layout || {}),
                        },
                    },
                },
            }, {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.bulk': {
            const { updates } = payload || {};
            if (!Array.isArray(updates) || updates.length === 0) return state;

            const nextNodes = { ...state.nodes };

            updates.forEach((update) => {
                const nodeId = update?.id;
                if (!nodeId) return;
                const node = nextNodes[nodeId];
                if (!node) return;

                const prevLayout = node.layout || {};
                const nextLayout = {
                    ...prevLayout,
                    ...(update.layout || {}),
                };

                if (update.x != null) nextLayout.x = update.x;
                if (update.y != null) nextLayout.y = update.y;
                if (update.width != null) nextLayout.width = update.width;
                if (update.height != null) nextLayout.height = update.height;

                nextNodes[nodeId] = {
                    ...node,
                    layout: nextLayout,
                };
            });

            return markLayoutDirty({
                ...state,
                nodes: nextNodes,
            }, {
                nodeIds: updates
                    .map((update) => update?.id)
                    .filter(Boolean),
            });
        }

        case 'node.layout.setConstraint': {
            const { nodeId, constraint } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};
            const prevConstraints = prevLayout.constraints || {};

            return markLayoutDirty({
                ...state,
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            constraints: {
                                ...prevConstraints,
                                ...(constraint || {}),
                            },
                        },
                    },
                },
            }, {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.clearConstraint': {
            const { nodeId, key } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};
            const prevConstraints = prevLayout.constraints || {};
            const nextConstraints = { ...prevConstraints };
            delete nextConstraints[key];

            return markLayoutDirty({
                ...state,
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            constraints: nextConstraints,
                        },
                    },
                },
            }, {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.setAutoLayout': {
            const { nodeId, config } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};
            const nextAutoLayout =
                config?.type === 'grid'
                    ? {
                          type: 'grid',
                          columns: 3,
                          rows: 'auto',
                          gap: 8,
                          padding: 8,
                          align: 'start',
                          justify: 'start',
                          ...config,
                      }
                    : {
                          type: 'flex',
                          direction: 'row',
                          gap: 8,
                          padding: 8,
                          align: 'start',
                          justify: 'start',
                          ...config,
                      };

            return markLayoutDirty({
                ...state,
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            autoLayout: nextAutoLayout,
                        },
                    },
                },
            }, {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.clearAutoLayout': {
            const { nodeId } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return markLayoutDirty({
                ...state,
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            autoLayout: null,
                        },
                    },
                },
            }, {
                nodeIds: [nodeId],
            });
        }

        default:
            return state;
    }
}
