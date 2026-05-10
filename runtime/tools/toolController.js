import {
    inferToolHandlerFamily,
    isApprovedToolHandlerFamily,
} from '@/runtime/tools/interpretToolSpec.js';

const TOOL_HANDLERS = new Map();

export function registerToolHandler(tool, handler, options = {}) {
    if (typeof tool !== 'string' || tool.length === 0) return;
    if (typeof handler !== 'function') return;

    const family = inferToolHandlerFamily({
        id: tool,
        handlerFamily: options.family,
    });
    if (!isApprovedToolHandlerFamily(family)) return;

    TOOL_HANDLERS.set(tool, {
        family,
        handler,
    });
}

export function unregisterToolHandler(tool) {
    if (typeof tool !== 'string' || tool.length === 0) return;
    TOOL_HANDLERS.delete(tool);
}

export function getToolHandler(tool) {
    if (typeof tool !== 'string' || tool.length === 0) return null;
    return TOOL_HANDLERS.get(tool)?.handler ?? null;
}

export function getToolHandlerFamily(tool) {
    if (typeof tool !== 'string' || tool.length === 0) return null;
    return TOOL_HANDLERS.get(tool)?.family ?? null;
}

export function __resetToolHandlers() {
    TOOL_HANDLERS.clear();
}
