import { SELECTION_ADD, SELECTION_CLEAR, SELECTION_REMOVE, SELECTION_SET } from '@/core/events/selectionEvents.js';

export const TOOL_HANDLERS = Object.freeze({
    createNode: createNodeIntent,
    session: sessionIntent,
    utility: utilityIntent,
});

export function resolveToolHandler(tool) {
    if (!tool) return null;
    if (tool.createsNode) return TOOL_HANDLERS.createNode;

    if (tool.id === 'move' || tool.id === 'resize' || tool.id === 'rotate') {
        return TOOL_HANDLERS.session;
    }

    if (tool.id === 'select') return TOOL_HANDLERS.utility;

    return null;
}

export function createNodeIntent(tool, ctx = {}) {
    if (!tool?.nodeType || !ctx?.position) return null;
    return {
        type: 'node/create',
        payload: {
            node: {
                type: tool.nodeType,
                position: ctx.position,
            },
        },
    };
}

export function sessionIntent(_tool, ctx = {}) {
    if (!ctx?.sessionType || !Array.isArray(ctx?.nodeIds) || ctx.nodeIds.length === 0) {
        return null;
    }

    return {
        type: 'session/start',
        payload: {
            sessionType: ctx.sessionType,
            sessionPayload: ctx.sessionPayload || {},
        },
    };
}

export function utilityIntent(tool, ctx = {}) {
    if (tool?.id !== 'select') return null;

    if (ctx?.hitNodeId) {
        if (ctx.additive) {
            return {
                type: SELECTION_ADD,
                payload: { id: ctx.hitNodeId },
            };
        }
        return {
            type: SELECTION_SET,
            payload: { ids: [ctx.hitNodeId] },
        };
    }

    return {
        type: SELECTION_CLEAR,
    };
}
