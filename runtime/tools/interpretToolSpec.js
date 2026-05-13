import { resolveToolExecutionSignature } from '@/runtime/tools/resolveToolExecutionSignature.js';

const APPROVED_TOOL_HANDLER_FAMILIES = Object.freeze(['createNode', 'session', 'utility']);

const KNOWN_TOOL_HANDLER_FAMILIES = Object.freeze({
    select: 'utility',
    move: 'session',
    resize: 'session',
    rotate: 'session',
    pan: 'session',
    zoom: 'session',
    frame: 'createNode',
    text: 'createNode',
    shape: 'createNode',
    image: 'createNode',
    layer: 'createNode',
});

function isPlainObject(value) {
    if (!value || typeof value !== 'object') return false;
    return Object.getPrototypeOf(value) === Object.prototype;
}

function normalizeString(value, field) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`interpretToolSpec requires non-empty ${field}`);
    }

    return value.trim();
}

function normalizeOptionalString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeBoolean(value) {
    return value === true;
}

function normalizeStringArray(values) {
    if (!Array.isArray(values)) return Object.freeze([]);

    const normalized = Array.from(
        new Set(
            values
                .filter((value) => typeof value === 'string')
                .map((value) => value.trim())
                .filter(Boolean),
        ),
    ).sort();

    return Object.freeze(normalized);
}

export function isApprovedToolHandlerFamily(handlerFamily) {
    return APPROVED_TOOL_HANDLER_FAMILIES.includes(handlerFamily);
}

export function inferToolHandlerFamily(spec) {
    if (!isPlainObject(spec)) return null;

    if (typeof spec.handlerFamily === 'string' && spec.handlerFamily.trim().length > 0) {
        return spec.handlerFamily.trim();
    }

    if (spec.createsNode) return 'createNode';
    if (typeof spec.sessionType === 'string' && spec.sessionType.trim().length > 0) return 'session';
    if (typeof spec.id === 'string' && spec.id.trim().length > 0) {
        return KNOWN_TOOL_HANDLER_FAMILIES[spec.id.trim()] ?? null;
    }

    return null;
}

function resolveHandlerFamily(spec, id) {
    return inferToolHandlerFamily({
        ...spec,
        id,
    });
}

function assertApprovedHandlerFamily(handlerFamily) {
    if (APPROVED_TOOL_HANDLER_FAMILIES.includes(handlerFamily)) return;
    throw new Error(`interpretToolSpec received unsupported handlerFamily "${handlerFamily}"`);
}

function buildHandlerPayload(spec, handlerFamily, id) {
    if (handlerFamily === 'createNode') {
        return Object.freeze({
            nodeType: normalizeString(spec.nodeType, 'nodeType'),
        });
    }

    if (handlerFamily === 'session') {
        return Object.freeze({
            sessionType: normalizeString(spec.sessionType ?? id, 'sessionType'),
        });
    }

    return Object.freeze({});
}

export { APPROVED_TOOL_HANDLER_FAMILIES };

export function interpretToolSpec(spec) {
    if (!isPlainObject(spec)) {
        throw new Error('interpretToolSpec requires a plain object spec');
    }

    const id = normalizeString(spec.id, 'id');
    const label = normalizeString(spec.label ?? id, 'label');
    const group = normalizeOptionalString(spec.group);
    const handlerFamily = resolveHandlerFamily(spec, id);

    if (!handlerFamily) {
        throw new Error(`interpretToolSpec could not resolve an approved handler family for "${id}"`);
    }

    assertApprovedHandlerFamily(handlerFamily);

    const interpreted = {
        id,
        label,
        group,
        defaultActive: normalizeBoolean(spec.defaultActive),
        handlerFamily,
        intentTopics: normalizeStringArray(spec.intentTopics),
        capabilityTags: normalizeStringArray(spec.capabilityTags),
        metadata: Object.freeze({
            createsNode: handlerFamily === 'createNode',
        }),
        handlerPayload: buildHandlerPayload(spec, handlerFamily, id),
    };

    interpreted.executionSignature = resolveToolExecutionSignature(interpreted);

    return Object.freeze(interpreted);
}
