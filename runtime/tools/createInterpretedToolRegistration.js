import { interpretToolSpec } from '@/runtime/tools/interpretToolSpec.js';

const TOOL_CAPABILITY_REQUIREMENTS = Object.freeze({
    select: Object.freeze(['node.select']),
    pan: Object.freeze(['viewport.pan']),
    zoom: Object.freeze(['viewport.zoom']),
    fit: Object.freeze(['viewport.fit']),
    frame: Object.freeze(['node.create']),
    text: Object.freeze(['node.create', 'content.write']),
    shape: Object.freeze(['node.create']),
    image: Object.freeze(['node.create', 'content.write']),
    layer: Object.freeze(['node.create']),
    move: Object.freeze(['layout.write']),
    resize: Object.freeze(['layout.write']),
    rotate: Object.freeze(['layout.write']),
});

function normalizeSource(source) {
    if (typeof source !== 'string' || source.trim().length === 0) {
        throw new Error('createInterpretedToolRegistration requires non-empty source');
    }

    return source.trim();
}

function normalizeCapabilitySet(capabilitySet) {
    if (capabilitySet instanceof Set) return capabilitySet;
    if (Array.isArray(capabilitySet)) return new Set(capabilitySet);
    return null;
}

function isCapabilityAllowed(toolId, capabilitySet) {
    if (!capabilitySet) return true;

    const required = TOOL_CAPABILITY_REQUIREMENTS[toolId] ?? [];
    return required.every((capability) => capabilitySet.has(capability));
}

function buildRegistrationIdentity(source, interpretedTool) {
    return `${source}:${interpretedTool.id}:${interpretedTool.handlerFamily}`;
}

function buildUnregistrationIdentity(source) {
    return `${source}:unregister`;
}

export function createInterpretedToolRegistration({ spec, source, capabilitySet } = {}) {
    const interpretedTool = interpretToolSpec(spec);
    const normalizedSource = normalizeSource(source);
    const normalizedCapabilitySet = normalizeCapabilitySet(capabilitySet);

    if (!isCapabilityAllowed(interpretedTool.id, normalizedCapabilitySet)) {
        return null;
    }

    return Object.freeze({
        registrationId: buildRegistrationIdentity(normalizedSource, interpretedTool),
        source: normalizedSource,
        interpretedTool,
        event: Object.freeze({
            type: 'capability.tools.register.requested',
            payload: Object.freeze({
                source: normalizedSource,
                tools: Object.freeze([interpretedTool.id]),
            }),
        }),
    });
}

export function createInterpretedToolUnregistration({ source } = {}) {
    const normalizedSource = normalizeSource(source);

    return Object.freeze({
        registrationId: buildUnregistrationIdentity(normalizedSource),
        source: normalizedSource,
        event: Object.freeze({
            type: 'capability.tools.unregister.requested',
            payload: Object.freeze({
                source: normalizedSource,
            }),
        }),
    });
}
