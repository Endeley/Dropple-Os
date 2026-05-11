import {
    createInterpretedToolRegistration,
    createInterpretedToolUnregistration,
} from '@/runtime/tools/createInterpretedToolRegistration.js';

function normalizeToolIdList(values) {
    if (!Array.isArray(values)) return [];

    return Array.from(
        new Set(
            values
                .filter((value) => typeof value === 'string')
                .map((value) => value.trim())
                .filter(Boolean),
        ),
    ).sort();
}

function resolveAllowedToolIds(allowedToolIds) {
    const normalized = normalizeToolIdList(allowedToolIds);
    return normalized.length > 0 ? new Set(normalized) : null;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let index = 0; index < a.length; index += 1) {
        if (a[index] !== b[index]) return false;
    }
    return true;
}

function resolveNextVisibleTools({ source, specs, capabilitySet, allowedToolIds }) {
    const allowed = resolveAllowedToolIds(allowedToolIds);
    const visibleTools = [];

    for (const spec of Array.isArray(specs) ? specs : []) {
        const registration = createInterpretedToolRegistration({
            source,
            spec,
            capabilitySet,
        });
        if (!registration) continue;

        const toolId = registration.interpretedTool.id;
        if (allowed && !allowed.has(toolId)) continue;
        visibleTools.push(toolId);
    }

    return normalizeToolIdList(visibleTools);
}

export function reconcileInterpretedToolVisibility({
    source,
    specs,
    capabilitySet,
    allowedToolIds,
    currentTools,
} = {}) {
    const nextTools = resolveNextVisibleTools({
        source,
        specs,
        capabilitySet,
        allowedToolIds,
    });
    const previousTools = normalizeToolIdList(currentTools);

    if (arraysEqual(previousTools, nextTools)) {
        return Object.freeze({
            source: typeof source === 'string' ? source.trim() : null,
            currentTools: Object.freeze(previousTools),
            nextTools: Object.freeze(nextTools),
            event: null,
        });
    }

    if (nextTools.length === 0) {
        const unregistration = createInterpretedToolUnregistration({ source });
        return Object.freeze({
            source: unregistration.source,
            currentTools: Object.freeze(previousTools),
            nextTools: Object.freeze(nextTools),
            event: unregistration.event,
        });
    }

    const firstVisibleSpec = (Array.isArray(specs) ? specs : []).find((spec) => {
        const toolId = typeof spec?.id === 'string' ? spec.id.trim() : null;
        return toolId && nextTools.includes(toolId);
    });
    const seedRegistration = createInterpretedToolRegistration({
        source,
        spec: firstVisibleSpec,
        capabilitySet,
    });

    return Object.freeze({
        source: seedRegistration.source,
        currentTools: Object.freeze(previousTools),
        nextTools: Object.freeze(nextTools),
        event: Object.freeze({
            type: 'capability.tools.register.requested',
            payload: Object.freeze({
                source: seedRegistration.source,
                tools: Object.freeze(nextTools),
            }),
        }),
    });
}
