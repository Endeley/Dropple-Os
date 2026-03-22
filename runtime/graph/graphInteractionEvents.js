import { EventTypes } from '@/core/events/eventTypes.js';

export function selectGraphNode(nodeId) {
    return {
        type: EventTypes.GRAPH_NODE_SELECT,
        payload: { nodeId },
    };
}

export function toggleGraphNode(nodeId) {
    return {
        type: EventTypes.GRAPH_NODE_TOGGLE,
        payload: { nodeId },
    };
}

export function clearGraphSelection() {
    return {
        type: EventTypes.GRAPH_NODE_CLEAR,
    };
}

export function startGraphDrag({ nodeId, origin, pointer }) {
    return {
        type: EventTypes.GRAPH_DRAG_START,
        payload: { nodeId, origin, pointer },
    };
}

export function updateGraphDrag(pointer) {
    return {
        type: EventTypes.GRAPH_DRAG_UPDATE,
        payload: { pointer },
    };
}

export function endGraphDrag() {
    return {
        type: EventTypes.GRAPH_DRAG_END,
    };
}

export function startGraphPan(pointer) {
    return {
        type: EventTypes.GRAPH_PAN_START,
        payload: { pointer },
    };
}

export function updateGraphPan(pointer) {
    return {
        type: EventTypes.GRAPH_PAN_UPDATE,
        payload: { pointer },
    };
}

export function endGraphPan() {
    return {
        type: EventTypes.GRAPH_PAN_END,
    };
}

export function zoomGraphViewport(delta) {
    return {
        type: EventTypes.GRAPH_VIEWPORT_ZOOM,
        payload: { delta },
    };
}

export function startGraphConnection({ fromNodeId, pointerX, pointerY }) {
    return {
        type: EventTypes.GRAPH_CONNECTION_START,
        payload: { fromNodeId, pointerX, pointerY },
    };
}

export function updateGraphConnection({ pointerX, pointerY }) {
    return {
        type: EventTypes.GRAPH_CONNECTION_UPDATE,
        payload: { pointerX, pointerY },
    };
}

export function endGraphConnection() {
    return {
        type: EventTypes.GRAPH_CONNECTION_END,
    };
}
