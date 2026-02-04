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

        default:
            return state;
    }
}
