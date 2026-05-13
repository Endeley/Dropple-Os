import { resolveSynthesizedToolProjectionMap } from '@/runtime/tools/resolveSynthesizedToolProjection.js';
import { resolveCanonicalDefaultActiveTool } from '@/runtime/tools/resolveToolDefaultActivation.js';

export const initialToolRuntimeState = Object.freeze({
    activeTool: 'select',
    registeredTools: {},
    registeredToolDescriptors: {},
    sourcePriority: {},
});

function resolvePolicyTimeMs(currentTimeMs) {
    return Number.isFinite(currentTimeMs) ? Number(currentTimeMs) : 0;
}

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

function normalizePriority(priority) {
    return Number.isFinite(priority) ? priority : 0;
}

function normalizeDescriptorEntry(descriptor) {
    if (!descriptor || typeof descriptor !== 'object') return null;

    const id = typeof descriptor.id === 'string' ? descriptor.id.trim() : '';
    if (!id) return null;

    return Object.freeze({
        ...descriptor,
        id,
    });
}

function normalizeDescriptors(descriptors) {
    if (!Array.isArray(descriptors)) return Object.freeze({});

    const entries = descriptors
        .map((descriptor) => normalizeDescriptorEntry(descriptor))
        .filter(Boolean)
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((descriptor) => [descriptor.id, descriptor]);

    return Object.freeze(Object.fromEntries(entries));
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

export function getVisibleToolDefinitions(toolState, { currentTimeMs } = {}) {
    const projections = resolveSynthesizedToolProjectionMap({
        ownership: getVisibleToolOwnership(toolState),
        registeredToolDescriptors: toolState?.registeredToolDescriptors ?? {},
        sourcePriority: toolState?.sourcePriority ?? {},
        currentTimeMs: resolvePolicyTimeMs(currentTimeMs),
    });

    return Object.freeze(
        Object.fromEntries(
            Object.entries(projections)
                .filter(([, projection]) => projection?.status === 'valid')
                .map(([toolId, projection]) => [
                    toolId,
                    Object.freeze({
                        id: toolId,
                        owners: projection.owners,
                        winnerSource: projection.winnerSource,
                        winnerPriority: projection.winnerPriority,
                        descriptor: projection.descriptor,
                    }),
                ]),
        ),
    );
}

export function getVisibleTools(toolState, { currentTimeMs } = {}) {
    return Object.keys(getVisibleToolDefinitions(toolState, { currentTimeMs }));
}

export function resolveCanonicalActiveTool(currentActiveTool, visibleTools, visibleToolDefinitions = null) {
    if (Array.isArray(visibleTools) && visibleTools.includes(currentActiveTool)) {
        return currentActiveTool;
    }

    const defaultActiveTool = resolveCanonicalDefaultActiveTool(visibleToolDefinitions);
    if (typeof defaultActiveTool === 'string' && Array.isArray(visibleTools) && visibleTools.includes(defaultActiveTool)) {
        return defaultActiveTool;
    }

    return Array.isArray(visibleTools) && visibleTools.length > 0
        ? visibleTools[0]
        : null;
}

export function registerToolSource(toolState, { source, tools, descriptors, priority } = {}, { currentTimeMs } = {}) {
    if (!source) return toolState ?? initialToolRuntimeState;

    const nextTools = normalizeTools(tools);
    const nextDescriptors = normalizeDescriptors(descriptors);
    const nextPriority = normalizePriority(priority);
    const currentState = toolState ?? initialToolRuntimeState;
    const nextRegisteredTools = {
        ...currentState.registeredTools,
        [source]: nextTools,
    };
    const nextRegisteredToolDescriptors = {
        ...(currentState.registeredToolDescriptors ?? {}),
        [source]: nextDescriptors,
    };
    const nextSourcePriority = {
        ...(currentState.sourcePriority ?? {}),
        [source]: nextPriority,
    };
    const nextVisibleTools = getVisibleTools({
        ...currentState,
        registeredTools: nextRegisteredTools,
        registeredToolDescriptors: nextRegisteredToolDescriptors,
        sourcePriority: nextSourcePriority,
    }, { currentTimeMs });
    const nextVisibleToolDefinitions = getVisibleToolDefinitions({
        ...currentState,
        registeredTools: nextRegisteredTools,
        registeredToolDescriptors: nextRegisteredToolDescriptors,
        sourcePriority: nextSourcePriority,
    }, { currentTimeMs });
    const nextActiveTool = resolveCanonicalActiveTool(
        currentState.activeTool,
        nextVisibleTools,
        nextVisibleToolDefinitions,
    );

    return {
        ...currentState,
        activeTool: nextActiveTool,
        registeredTools: nextRegisteredTools,
        registeredToolDescriptors: nextRegisteredToolDescriptors,
        sourcePriority: nextSourcePriority,
    };
}

export function unregisterToolSource(toolState, { source } = {}, { currentTimeMs } = {}) {
    if (!source) return toolState ?? initialToolRuntimeState;

    const currentState = toolState ?? initialToolRuntimeState;
    if (!Object.prototype.hasOwnProperty.call(currentState.registeredTools, source)) {
        return currentState;
    }

    const nextRegisteredTools = { ...currentState.registeredTools };
    const nextRegisteredToolDescriptors = { ...(currentState.registeredToolDescriptors ?? {}) };
    const nextSourcePriority = { ...(currentState.sourcePriority ?? {}) };
    delete nextRegisteredTools[source];
    delete nextRegisteredToolDescriptors[source];
    delete nextSourcePriority[source];

    const nextVisibleTools = getVisibleTools({
        ...currentState,
        registeredTools: nextRegisteredTools,
        registeredToolDescriptors: nextRegisteredToolDescriptors,
        sourcePriority: nextSourcePriority,
    }, { currentTimeMs });
    const nextVisibleToolDefinitions = getVisibleToolDefinitions({
        ...currentState,
        registeredTools: nextRegisteredTools,
        registeredToolDescriptors: nextRegisteredToolDescriptors,
        sourcePriority: nextSourcePriority,
    }, { currentTimeMs });
    const nextActiveTool = resolveCanonicalActiveTool(
        currentState.activeTool,
        nextVisibleTools,
        nextVisibleToolDefinitions,
    );

    return {
        ...currentState,
        activeTool: nextActiveTool,
        registeredTools: nextRegisteredTools,
        registeredToolDescriptors: nextRegisteredToolDescriptors,
        sourcePriority: nextSourcePriority,
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
