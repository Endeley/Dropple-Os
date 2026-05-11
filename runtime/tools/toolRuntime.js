export const initialToolRuntimeState = Object.freeze({
    activeTool: 'select',
    registeredTools: {},
});

function normalizeSourceIds(registeredTools) {
    return Object.keys(registeredTools ?? {}).sort((left, right) => left.localeCompare(right));
}

function normalizeTools(tools) {
    if (!Array.isArray(tools)) return [];

    return Array.from(
        new Set(
            tools
                .filter((tool) => typeof tool === 'string' && tool.length > 0)
                .map((tool) => tool.trim())
                .filter(Boolean),
        ),
    );
}

export function getVisibleToolOwnership(toolState) {
    const registeredTools = toolState?.registeredTools ?? {};
    const ownership = new Map();

    for (const source of normalizeSourceIds(registeredTools)) {
        for (const tool of normalizeTools(registeredTools[source])) {
            if (!ownership.has(tool)) {
                ownership.set(tool, []);
            }
            ownership.get(tool).push(source);
        }
    }

    return Object.freeze(
        Object.fromEntries(
            Array.from(ownership.entries()).map(([toolId, sources]) => [
                toolId,
                Object.freeze([...sources]),
            ]),
        ),
    );
}

export function getVisibleTools(toolState) {
    return Object.keys(getVisibleToolOwnership(toolState));
}

export function resolveCanonicalActiveTool(currentActiveTool, visibleTools) {
    if (Array.isArray(visibleTools) && visibleTools.includes(currentActiveTool)) {
        return currentActiveTool;
    }

    return Array.isArray(visibleTools) && visibleTools.length > 0
        ? visibleTools[0]
        : null;
}

export function registerToolSource(toolState, { source, tools } = {}) {
    if (!source) return toolState ?? initialToolRuntimeState;

    const nextTools = normalizeTools(tools);
    const currentState = toolState ?? initialToolRuntimeState;
    const nextRegisteredTools = {
        ...currentState.registeredTools,
        [source]: nextTools,
    };
    const nextVisibleTools = getVisibleTools({
        ...currentState,
        registeredTools: nextRegisteredTools,
    });
    const nextActiveTool = resolveCanonicalActiveTool(currentState.activeTool, nextVisibleTools);

    return {
        ...currentState,
        activeTool: nextActiveTool,
        registeredTools: nextRegisteredTools,
    };
}

export function unregisterToolSource(toolState, { source } = {}) {
    if (!source) return toolState ?? initialToolRuntimeState;

    const currentState = toolState ?? initialToolRuntimeState;
    if (!Object.prototype.hasOwnProperty.call(currentState.registeredTools, source)) {
        return currentState;
    }

    const nextRegisteredTools = { ...currentState.registeredTools };
    delete nextRegisteredTools[source];

    const nextVisibleTools = getVisibleTools({
        ...currentState,
        registeredTools: nextRegisteredTools,
    });
    const nextActiveTool = resolveCanonicalActiveTool(currentState.activeTool, nextVisibleTools);

    return {
        ...currentState,
        activeTool: nextActiveTool,
        registeredTools: nextRegisteredTools,
    };
}

export function setRuntimeActiveTool(toolState, nextTool) {
    const currentState = toolState ?? initialToolRuntimeState;
    const visibleTools = getVisibleTools(currentState);
    if (!visibleTools.includes(nextTool)) {
        return currentState;
    }

    return {
        ...currentState,
        activeTool: nextTool,
    };
}
