import { EventTypes } from '@/core/events/eventTypes.js';
import { createInitialGraphInteractionState } from '../graphInteractionState.js';

const DEFAULT_SELECTION = Object.freeze({
    ids: Object.freeze([]),
    primary: null,
});

const DEFAULT_DRAG = Object.freeze({
    active: false,
    nodeId: null,
    origin: null,
    startPointer: null,
    currentPointer: null,
});

const DEFAULT_PAN = Object.freeze({
    active: false,
    anchor: null,
});

const DEFAULT_VIEWPORT = Object.freeze({
    x: 0,
    y: 0,
    zoom: 1,
});

const DEFAULT_CONNECTION = Object.freeze({
    active: false,
    fromNodeId: null,
    pointerX: 0,
    pointerY: 0,
});

function clampZoom(value) {
    return Math.max(0.5, Math.min(2, Number(value) || 1));
}

function getGraphState(state) {
    return state?.graph ?? createInitialGraphInteractionState();
}

function normalizeSelection(ids, primary = null) {
    const nextIds = Array.from(new Set((Array.isArray(ids) ? ids : []).filter(Boolean)));
    const nextPrimary = nextIds.includes(primary) ? primary : nextIds[0] ?? null;

    return {
        ids: nextIds,
        primary: nextPrimary,
    };
}

function clearDragState() {
    return {
        ...DEFAULT_DRAG,
    };
}

function clearPanState() {
    return {
        ...DEFAULT_PAN,
    };
}

function clearConnectionState() {
    return {
        ...DEFAULT_CONNECTION,
    };
}

export function graphInteractionReducer(state, event) {
    const graph = getGraphState(state);

    switch (event?.type) {
        case EventTypes.GRAPH_NODE_SELECT: {
            const nodeId = event?.payload?.nodeId ?? null;
            return {
                ...state,
                graph: {
                    ...graph,
                    selection: normalizeSelection(nodeId ? [nodeId] : [], nodeId),
                },
            };
        }
        case EventTypes.GRAPH_NODE_TOGGLE: {
            const nodeId = event?.payload?.nodeId ?? null;
            if (!nodeId) return state;

            const currentIds = Array.isArray(graph.selection?.ids) ? graph.selection.ids : [];
            const hasNode = currentIds.includes(nodeId);
            const nextIds = hasNode
                ? currentIds.filter((id) => id !== nodeId)
                : [...currentIds, nodeId];

            return {
                ...state,
                graph: {
                    ...graph,
                    selection: normalizeSelection(nextIds, hasNode ? currentIds[0] ?? null : nodeId),
                },
            };
        }
        case EventTypes.GRAPH_NODE_CLEAR: {
            return {
                ...state,
                graph: {
                    ...graph,
                    selection: {
                        ...DEFAULT_SELECTION,
                    },
                },
            };
        }
        case EventTypes.GRAPH_DRAG_START: {
            const nodeId = event?.payload?.nodeId ?? null;
            const origin = event?.payload?.origin ?? null;
            const pointer = event?.payload?.pointer ?? null;

            return {
                ...state,
                graph: {
                    ...graph,
                    selection: normalizeSelection(nodeId ? [nodeId] : graph.selection?.ids, nodeId),
                    drag: {
                        active: Boolean(nodeId),
                        nodeId,
                        origin: origin
                            ? {
                                x: Number(origin.x ?? 0),
                                y: Number(origin.y ?? 0),
                            }
                            : null,
                        startPointer: pointer
                            ? {
                                x: Number(pointer.x ?? 0),
                                y: Number(pointer.y ?? 0),
                            }
                            : null,
                        currentPointer: pointer
                            ? {
                                x: Number(pointer.x ?? 0),
                                y: Number(pointer.y ?? 0),
                            }
                            : null,
                    },
                },
            };
        }
        case EventTypes.GRAPH_DRAG_UPDATE: {
            if (!graph.drag?.active) return state;

            const pointer = event?.payload?.pointer ?? null;

            return {
                ...state,
                graph: {
                    ...graph,
                    drag: {
                        ...graph.drag,
                        currentPointer: pointer
                            ? {
                                x: Number(pointer.x ?? 0),
                                y: Number(pointer.y ?? 0),
                            }
                            : graph.drag.currentPointer,
                    },
                },
            };
        }
        case EventTypes.GRAPH_DRAG_END: {
            if (!graph.drag?.active) return state;

            return {
                ...state,
                graph: {
                    ...graph,
                    drag: clearDragState(),
                },
            };
        }
        case EventTypes.GRAPH_PAN_START: {
            const pointer = event?.payload?.pointer ?? null;

            return {
                ...state,
                graph: {
                    ...graph,
                    pan: {
                        active: true,
                        anchor: pointer
                            ? {
                                x: Number(pointer.x ?? 0),
                                y: Number(pointer.y ?? 0),
                            }
                            : null,
                    },
                },
            };
        }
        case EventTypes.GRAPH_PAN_UPDATE: {
            if (!graph.pan?.active || !graph.pan?.anchor) return state;

            const pointer = event?.payload?.pointer ?? null;
            if (!pointer) return state;

            const nextPointer = {
                x: Number(pointer.x ?? 0),
                y: Number(pointer.y ?? 0),
            };
            const dx = nextPointer.x - Number(graph.pan.anchor.x ?? 0);
            const dy = nextPointer.y - Number(graph.pan.anchor.y ?? 0);

            return {
                ...state,
                graph: {
                    ...graph,
                    pan: {
                        active: true,
                        anchor: nextPointer,
                    },
                    viewport: {
                        ...graph.viewport,
                        x: Number(graph.viewport?.x ?? 0) + dx,
                        y: Number(graph.viewport?.y ?? 0) + dy,
                    },
                },
            };
        }
        case EventTypes.GRAPH_PAN_END: {
            if (!graph.pan?.active) return state;

            return {
                ...state,
                graph: {
                    ...graph,
                    pan: clearPanState(),
                },
            };
        }
        case EventTypes.GRAPH_VIEWPORT_ZOOM: {
            const delta = Number(event?.payload?.delta ?? 0);
            return {
                ...state,
                graph: {
                    ...graph,
                    viewport: {
                        ...graph.viewport,
                        zoom: clampZoom(Number(graph.viewport?.zoom ?? 1) - delta * 0.001),
                    },
                },
            };
        }
        case EventTypes.GRAPH_CONNECTION_START: {
            const fromNodeId = event?.payload?.fromNodeId ?? null;
            return {
                ...state,
                graph: {
                    ...graph,
                    connection: {
                        active: Boolean(fromNodeId),
                        fromNodeId,
                        pointerX: Number(event?.payload?.pointerX ?? 0),
                        pointerY: Number(event?.payload?.pointerY ?? 0),
                    },
                },
            };
        }
        case EventTypes.GRAPH_CONNECTION_UPDATE: {
            if (!graph.connection?.active) return state;
            return {
                ...state,
                graph: {
                    ...graph,
                    connection: {
                        ...graph.connection,
                        pointerX: Number(event?.payload?.pointerX ?? graph.connection.pointerX ?? 0),
                        pointerY: Number(event?.payload?.pointerY ?? graph.connection.pointerY ?? 0),
                    },
                },
            };
        }
        case EventTypes.GRAPH_CONNECTION_END: {
            if (!graph.connection?.active) return state;
            return {
                ...state,
                graph: {
                    ...graph,
                    connection: clearConnectionState(),
                },
            };
        }
        case EventTypes.GRAPH_NODE_DELETE: {
            const deletedNodeId = event?.payload?.nodeId ?? null;
            if (!deletedNodeId) return state;

            const selectionIds = Array.isArray(graph.selection?.ids) ? graph.selection.ids : [];
            const nextSelectionIds = selectionIds.filter((id) => id !== deletedNodeId);
            const deletingDragNode = graph.drag?.nodeId === deletedNodeId;
            const deletingConnectionNode =
                graph.connection?.fromNodeId === deletedNodeId;

            return {
                ...state,
                graph: {
                    ...graph,
                    selection: normalizeSelection(nextSelectionIds, graph.selection?.primary ?? null),
                    drag: deletingDragNode ? clearDragState() : graph.drag,
                    connection: deletingConnectionNode ? clearConnectionState() : graph.connection,
                },
            };
        }
        default:
            return state;
    }
}
