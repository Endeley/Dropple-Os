const TOOL_HANDLERS = new Map();

export function registerToolHandler(tool, handler) {
    if (typeof tool !== 'string' || tool.length === 0) return;
    if (typeof handler !== 'function') return;
    TOOL_HANDLERS.set(tool, handler);
}

export function unregisterToolHandler(tool) {
    if (typeof tool !== 'string' || tool.length === 0) return;
    TOOL_HANDLERS.delete(tool);
}

export function getToolHandler(tool) {
    if (typeof tool !== 'string' || tool.length === 0) return null;
    return TOOL_HANDLERS.get(tool) ?? null;
}

export function __resetToolHandlers() {
    TOOL_HANDLERS.clear();
}
