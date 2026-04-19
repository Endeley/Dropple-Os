import { canvasBus } from '@/ui/eventBus/canvasBus.js';

export const GRAPH_INTENTS = Object.freeze({
    ENABLE: 'intent.graph.enable',
    DISABLE: 'intent.graph.disable',
    SET_RIG: 'intent.graph.set-rig',
    SET_PRIORITY: 'intent.graph.set-priority',
    METADATA_UPDATE: 'intent.graph.metadata.update',
    NODE_CREATE: 'intent.graph.node.create',
    NODE_DELETE: 'intent.graph.node.delete',
    NODE_UPDATE: 'intent.graph.node.update',
    OUTPUT_SET: 'intent.graph.output.set',
    CONNECTION_CREATE: 'intent.graph.connection.create',
    CONNECTION_DELETE: 'intent.graph.connection.delete',
});

export function graphIntentEnable({ graphId } = {}) {
    if (!graphId) return;
    canvasBus.emit(GRAPH_INTENTS.ENABLE, { graphId });
}

export function graphIntentDisable({ graphId } = {}) {
    if (!graphId) return;
    canvasBus.emit(GRAPH_INTENTS.DISABLE, { graphId });
}

export function graphIntentSetRig({ graphId, rigId } = {}) {
    if (!graphId) return;
    canvasBus.emit(GRAPH_INTENTS.SET_RIG, {
        graphId,
        rigId: rigId ?? null,
    });
}

export function graphIntentSetPriority({ graphId, priority } = {}) {
    if (!graphId || !Number.isFinite(priority)) return;
    canvasBus.emit(GRAPH_INTENTS.SET_PRIORITY, {
        graphId,
        priority,
    });
}

export function graphIntentMetadataUpdate({ graphId, patch } = {}) {
    if (!graphId || !patch || typeof patch !== 'object') return;
    canvasBus.emit(GRAPH_INTENTS.METADATA_UPDATE, {
        graphId,
        patch,
    });
}

export function graphIntentNodeCreate({ graphId, nodeId, nodeType, position } = {}) {
    if (!graphId || !nodeId || !nodeType) return;

    canvasBus.emit(GRAPH_INTENTS.NODE_CREATE, {
        graphId,
        nodeId,
        nodeType,
        position: {
            x: Number(position?.x ?? 0),
            y: Number(position?.y ?? 0),
        },
    });
}

export function graphIntentNodeDelete({ graphId, nodeId } = {}) {
    if (!graphId || !nodeId) return;

    canvasBus.emit(GRAPH_INTENTS.NODE_DELETE, {
        graphId,
        nodeId,
    });
}

export function graphIntentNodeUpdate({ graphId, nodeId, patch } = {}) {
    if (!graphId || !nodeId || !patch || typeof patch !== 'object') return;

    canvasBus.emit(GRAPH_INTENTS.NODE_UPDATE, {
        graphId,
        nodeId,
        patch,
    });
}

export function graphIntentOutputSet({ graphId, nodeId } = {}) {
    if (!graphId || !nodeId) return;

    canvasBus.emit(GRAPH_INTENTS.OUTPUT_SET, {
        graphId,
        nodeId,
    });
}

export function graphIntentConnectionCreate({ graphId, from, to, input } = {}) {
    if (!graphId || !from || !to || !input) return;

    canvasBus.emit(GRAPH_INTENTS.CONNECTION_CREATE, {
        graphId,
        from,
        to,
        input,
    });
}

export function graphIntentConnectionDelete({ graphId, from, to, input } = {}) {
    if (!graphId || !from || !to || !input) return;

    canvasBus.emit(GRAPH_INTENTS.CONNECTION_DELETE, {
        graphId,
        from,
        to,
        input,
    });
}
