import { EventTypes } from '@/core/events/eventTypes.js';

const CAPABILITY_REGISTER_EVENT = 'capability.tools.register.requested';
const CAPABILITY_UNREGISTER_EVENT = 'capability.tools.unregister.requested';

const RECURSIVE_REGISTRATION_TYPES = Object.freeze(new Set([
    CAPABILITY_REGISTER_EVENT,
    CAPABILITY_UNREGISTER_EVENT,
    EventTypes.TOOLS_REGISTER,
    EventTypes.TOOLS_UNREGISTER,
]));

export function isSynthesizedToolSource(source) {
    if (typeof source !== 'string') return false;
    const normalized = source.trim();
    return normalized.startsWith('capability.')
        || normalized.startsWith('synth.')
        || normalized.startsWith('interpreted.');
}

function containsRecursiveRegistrationIntent(value, depth = 0) {
    if (depth > 12) return false;
    if (!value || typeof value !== 'object') return false;

    if (typeof value.type === 'string' && RECURSIVE_REGISTRATION_TYPES.has(value.type)) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.some((entry) => containsRecursiveRegistrationIntent(entry, depth + 1));
    }

    return Object.values(value).some((entry) => containsRecursiveRegistrationIntent(entry, depth + 1));
}

export function validateNoRecursiveToolRegistration(payload) {
    const source = payload?.source;
    if (!isSynthesizedToolSource(source)) {
        return Object.freeze({ ok: true });
    }

    const nestedPayload = {
        tools: payload?.tools,
        descriptors: payload?.descriptors,
        metadata: payload?.metadata,
        events: payload?.events,
        actions: payload?.actions,
    };

    if (containsRecursiveRegistrationIntent(nestedPayload)) {
        return Object.freeze({
            ok: false,
            code: 'tool-registration-recursive-sovereignty-blocked',
            message: 'Synthesized tool registration payload contains nested tool-registration intents/actions',
        });
    }

    return Object.freeze({ ok: true });
}

