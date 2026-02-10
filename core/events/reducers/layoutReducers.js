// core/events/reducers/layoutReducers.js

import { EventTypes } from '../eventTypes.js';

export function layoutReducers(state, event) {
    const { type, payload } = event;

    switch (type) {
        case EventTypes.NODE_MOVE: {
            const { id, xDelta, yDelta } = payload;
            const node = state.nodes[id];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return {
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
            };
        }

        case 'node.layout.move': {
            const { nodeId, x, y } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return {
                ...state,
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            x,
                            y,
                        },
                    },
                },
            };
        }

        case EventTypes.NODE_RESIZE: {
            const { id, width, height } = payload;
            const node = state.nodes[id];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return {
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
            };
        }

        case 'node.layout.resize': {
            const { nodeId, width, height } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return {
                ...state,
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        layout: {
                            ...prevLayout,
                            width,
                            height,
                        },
                    },
                },
            };
        }

        case 'node.layout.update': {
            const { nodeId, layout } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return {
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
            };
        }

        case 'node.layout.setConstraint': {
            const { nodeId, constraint } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};
            const prevConstraints = prevLayout.constraints || {};

            return {
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
            };
        }

        case 'node.layout.clearConstraint': {
            const { nodeId, key } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};
            const prevConstraints = prevLayout.constraints || {};
            const nextConstraints = { ...prevConstraints };
            delete nextConstraints[key];

            return {
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
            };
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

            return {
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
            };
        }

        case 'node.layout.clearAutoLayout': {
            const { nodeId } = payload;
            const node = state.nodes[nodeId];
            if (!node) return state;

            const prevLayout = node.layout || {};

            return {
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
            };
        }

        default:
            return state;
    }
}
