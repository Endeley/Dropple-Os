import { isApprovedToolHandlerFamily } from '@/runtime/tools/interpretToolSpec.js';

const SYNTHESIZED_SOURCE_PREFIXES = Object.freeze([
    'capability.',
    'synth.',
    'interpreted.',
]);

const ALLOWED_DESCRIPTOR_KEYS = Object.freeze(new Set([
    'id',
    'label',
    'group',
    'defaultActive',
    'intentTopics',
    'capabilityTags',
    'metadata',
    'handlerFamily',
    'handlerPayload',
    'executionSignature',
]));

const FORBIDDEN_AUTHORITY_KEYS = Object.freeze([
    'dispatch',
    'dispatcher',
    'dispatchEvent',
    'mutate',
    'mutation',
    'reducer',
    'state',
    'setState',
    'runtimeState',
    'store',
    'execute',
    'handler',
    'onPointerDown',
    'onPointerMove',
    'onPointerUp',
    'onKeyDown',
]);

function isSynthesizedSource(source) {
    return SYNTHESIZED_SOURCE_PREFIXES.some((prefix) => source.startsWith(prefix));
}

function hasForbiddenAuthorityKeys(descriptor) {
    return FORBIDDEN_AUTHORITY_KEYS.some((key) =>
        Object.prototype.hasOwnProperty.call(descriptor, key),
    );
}

function validateDescriptor(descriptor, index) {
    if (!descriptor || typeof descriptor !== 'object') {
        return Object.freeze({
            ok: false,
            code: 'tool-registration-descriptor-invalid',
            message: `descriptor at index ${index} must be an object`,
        });
    }

    const unknownKeys = Object.keys(descriptor).filter((key) => !ALLOWED_DESCRIPTOR_KEYS.has(key));
    if (unknownKeys.length > 0) {
        return Object.freeze({
            ok: false,
            code: 'tool-registration-descriptor-authority-leak',
            message: `descriptor at index ${index} contains non-constitutional keys: ${unknownKeys.sort().join(', ')}`,
        });
    }

    if (hasForbiddenAuthorityKeys(descriptor)) {
        return Object.freeze({
            ok: false,
            code: 'tool-registration-descriptor-authority-leak',
            message: `descriptor at index ${index} contains forbidden authority keys`,
        });
    }

    const handlerFamily = typeof descriptor.handlerFamily === 'string'
        ? descriptor.handlerFamily.trim()
        : '';
    if (!isApprovedToolHandlerFamily(handlerFamily)) {
        return Object.freeze({
            ok: false,
            code: 'tool-registration-handler-family-invalid',
            message: `descriptor at index ${index} has unsupported handlerFamily "${handlerFamily}"`,
        });
    }

    return Object.freeze({ ok: true });
}

export function validateToolRegistrationIngress(payload) {
    const source = typeof payload?.source === 'string' ? payload.source.trim() : '';
    if (!source) {
        return Object.freeze({
            ok: false,
            code: 'tool-registration-source-invalid',
            message: 'tool registration requires non-empty source',
        });
    }

    if (!isSynthesizedSource(source)) {
        return Object.freeze({ ok: true });
    }

    const descriptors = Array.isArray(payload?.descriptors) ? payload.descriptors : [];
    for (let index = 0; index < descriptors.length; index += 1) {
        const result = validateDescriptor(descriptors[index], index);
        if (!result.ok) return result;
    }

    return Object.freeze({ ok: true });
}

