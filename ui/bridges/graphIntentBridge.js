import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes.js';
import { GRAPH_INTENTS } from '@/ui/graph/graphIntent.js';
import { getGraphNodeTemplate } from '@/ui/workspace/media/animation/graphNodeCatalog.js';
import { canvasBus } from '../eventBus/canvasBus.js';

let registered = false;

export function emitGraphIntent(event) {
    if (!event?.type) return;
    canvasBus.emit('intent.graph.event', { event });
}

export function registerGraphIntentBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const dispatch = dispatcher?.dispatch ?? dispatcher;

    const onGraphEnable = (payload) => {
        const graphId = payload?.graphId ?? null;
        if (typeof dispatch !== 'function' || !graphId) return;
        dispatch({
            type: EventTypes.GRAPH_ENABLE,
            payload: { graphId },
        });
    };

    const onGraphDisable = (payload) => {
        const graphId = payload?.graphId ?? null;
        if (typeof dispatch !== 'function' || !graphId) return;
        dispatch({
            type: EventTypes.GRAPH_DISABLE,
            payload: { graphId },
        });
    };

    const onGraphSetRig = (payload) => {
        const graphId = payload?.graphId ?? null;
        if (typeof dispatch !== 'function' || !graphId) return;
        dispatch({
            type: EventTypes.GRAPH_SET_RIG,
            payload: {
                graphId,
                rigId: payload?.rigId ?? null,
            },
        });
    };

    const onGraphSetPriority = (payload) => {
        const graphId = payload?.graphId ?? null;
        const priority = payload?.priority;
        if (typeof dispatch !== 'function' || !graphId || !Number.isFinite(priority)) return;
        dispatch({
            type: EventTypes.GRAPH_SET_PRIORITY,
            payload: {
                graphId,
                priority,
            },
        });
    };

    const onGraphMetadataUpdate = (payload) => {
        const graphId = payload?.graphId ?? null;
        const patch = payload?.patch ?? null;
        if (typeof dispatch !== 'function' || !graphId || !patch || typeof patch !== 'object') return;
        dispatch({
            type: EventTypes.GRAPH_METADATA_UPDATE,
            payload: {
                graphId,
                patch,
            },
        });
    };

    const onGraphNodeCreate = (payload) => {
        if (typeof dispatch !== 'function') return;

        const graphId = payload?.graphId ?? null;
        const nodeType = payload?.nodeType ?? null;
        const nodeId = payload?.nodeId ?? `${String(nodeType ?? 'node')}-${nanoid(6)}`;
        if (!graphId || !nodeType || !nodeId) return;

        const node = getGraphNodeTemplate(nodeType, {
            id: nodeId,
            position: {
                x: Number(payload?.position?.x ?? 0),
                y: Number(payload?.position?.y ?? 0),
            },
        });
        if (!node) return;

        dispatch({
            type: EventTypes.GRAPH_NODE_ADD,
            payload: {
                graphId,
                node,
            },
        });
    };

    const onGraphNodeDelete = (payload) => {
        if (typeof dispatch !== 'function') return;

        const graphId = payload?.graphId ?? null;
        const nodeId = payload?.nodeId ?? null;
        if (!graphId || !nodeId) return;

        dispatch({
            type: EventTypes.GRAPH_NODE_DELETE,
            payload: {
                graphId,
                nodeId,
            },
        });
    };

    const onGraphNodeUpdate = (payload) => {
        if (typeof dispatch !== 'function') return;

        const graphId = payload?.graphId ?? null;
        const nodeId = payload?.nodeId ?? null;
        const patch = payload?.patch ?? null;
        if (!graphId || !nodeId || !patch || typeof patch !== 'object') return;

        dispatch({
            type: EventTypes.GRAPH_NODE_UPDATE,
            payload: {
                graphId,
                nodeId,
                patch,
            },
        });
    };

    const onGraphOutputSet = (payload) => {
        if (typeof dispatch !== 'function') return;

        const graphId = payload?.graphId ?? null;
        const nodeId = payload?.nodeId ?? null;
        if (!graphId || !nodeId) return;

        dispatch({
            type: EventTypes.GRAPH_OUTPUT_SET,
            payload: {
                graphId,
                nodeId,
            },
        });
    };

    const onGraphConnectionCreate = (payload) => {
        if (typeof dispatch !== 'function') return;

        const graphId = payload?.graphId ?? null;
        const from = payload?.from ?? null;
        const to = payload?.to ?? null;
        const input = payload?.input ?? null;
        if (!graphId || !from || !to || !input) return;

        dispatch({
            type: EventTypes.GRAPH_CONNECT,
            payload: {
                graphId,
                from,
                to,
                input,
            },
        });
    };

    const onGraphConnectionDelete = (payload) => {
        if (typeof dispatch !== 'function') return;

        const graphId = payload?.graphId ?? null;
        const from = payload?.from ?? null;
        const to = payload?.to ?? null;
        const input = payload?.input ?? null;
        if (!graphId || !from || !to || !input) return;

        dispatch({
            type: EventTypes.GRAPH_DISCONNECT,
            payload: {
                graphId,
                from,
                to,
                input,
            },
        });
    };

    const onGraphEvent = (payload) => {
        if (!payload?.event?.type || typeof dispatch !== 'function') return;
        dispatch(payload.event);
    };

    canvasBus.on(GRAPH_INTENTS.ENABLE, onGraphEnable);
    canvasBus.on(GRAPH_INTENTS.DISABLE, onGraphDisable);
    canvasBus.on(GRAPH_INTENTS.SET_RIG, onGraphSetRig);
    canvasBus.on(GRAPH_INTENTS.SET_PRIORITY, onGraphSetPriority);
    canvasBus.on(GRAPH_INTENTS.METADATA_UPDATE, onGraphMetadataUpdate);
    canvasBus.on(GRAPH_INTENTS.NODE_DELETE, onGraphNodeDelete);
    canvasBus.on(GRAPH_INTENTS.NODE_UPDATE, onGraphNodeUpdate);
    canvasBus.on(GRAPH_INTENTS.NODE_CREATE, onGraphNodeCreate);
    canvasBus.on(GRAPH_INTENTS.OUTPUT_SET, onGraphOutputSet);
    canvasBus.on(GRAPH_INTENTS.CONNECTION_CREATE, onGraphConnectionCreate);
    canvasBus.on(GRAPH_INTENTS.CONNECTION_DELETE, onGraphConnectionDelete);
    canvasBus.on('intent.graph.event', onGraphEvent);

    return () => {
        canvasBus.off(GRAPH_INTENTS.ENABLE, onGraphEnable);
        canvasBus.off(GRAPH_INTENTS.DISABLE, onGraphDisable);
        canvasBus.off(GRAPH_INTENTS.SET_RIG, onGraphSetRig);
        canvasBus.off(GRAPH_INTENTS.SET_PRIORITY, onGraphSetPriority);
        canvasBus.off(GRAPH_INTENTS.METADATA_UPDATE, onGraphMetadataUpdate);
        canvasBus.off(GRAPH_INTENTS.NODE_DELETE, onGraphNodeDelete);
        canvasBus.off(GRAPH_INTENTS.NODE_UPDATE, onGraphNodeUpdate);
        canvasBus.off(GRAPH_INTENTS.NODE_CREATE, onGraphNodeCreate);
        canvasBus.off(GRAPH_INTENTS.OUTPUT_SET, onGraphOutputSet);
        canvasBus.off(GRAPH_INTENTS.CONNECTION_CREATE, onGraphConnectionCreate);
        canvasBus.off(GRAPH_INTENTS.CONNECTION_DELETE, onGraphConnectionDelete);
        canvasBus.off('intent.graph.event', onGraphEvent);
        registered = false;
    };
}
