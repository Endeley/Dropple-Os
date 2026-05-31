import { EventTypes } from '@/core/events/eventTypes.js';

export const ASSISTANT_ACTIONS = Object.freeze([
    'recommend',
    'generate',
    'explain',
    'automate',
    'execute-approved-workflow',
]);

export const ASSISTANT_FORBIDDEN_AUTHORITIES = Object.freeze([
    'dispatcher-mutation-authority',
    'document-truth-authority',
    'runtime-truth-authority',
]);

const ASSISTANT_PERSPECTIVES = Object.freeze(['create', 'build', 'operate', 'collaborate', 'publish']);

function normalizeStringList(input, { field, allowed = null } = {}) {
    if (!Array.isArray(input)) {
        throw new Error(`${field} must be an array`);
    }
    const normalized = [...new Set(input.map((entry) => String(entry ?? '').trim()).filter(Boolean))].sort();
    if (allowed) {
        for (const value of normalized) {
            if (!allowed.has(value)) {
                throw new Error(`${field} contains unsupported value: ${value}`);
            }
        }
    }
    return Object.freeze(normalized);
}

export function normalizeAssistantCapabilityV1(input) {
    if (!input || typeof input !== 'object') {
        throw new Error('assistant capability must be an object');
    }

    const id = String(input.id ?? '').trim();
    const perspectiveId = String(input.perspectiveId ?? '').trim();
    const label = String(input.label ?? '').trim();

    if (!id) throw new Error('assistant capability missing required field: id');
    if (!label) throw new Error('assistant capability missing required field: label');
    if (!ASSISTANT_PERSPECTIVES.includes(perspectiveId)) {
        throw new Error(`assistant capability perspective must be one of: ${ASSISTANT_PERSPECTIVES.join(', ')}`);
    }

    const actions = normalizeStringList(input.actions, {
        field: 'actions',
        allowed: new Set(ASSISTANT_ACTIONS),
    });
    const forbiddenAuthorities = normalizeStringList(input.forbiddenAuthorities, {
        field: 'forbiddenAuthorities',
        allowed: new Set(ASSISTANT_FORBIDDEN_AUTHORITIES),
    });
    const allowedEventTypes = normalizeStringList(input.allowedEventTypes, {
        field: 'allowedEventTypes',
        allowed: new Set([EventTypes.AI_REQUEST_ENQUEUE]),
    });

    return Object.freeze({
        schemaVersion: 1,
        id,
        label,
        perspectiveId,
        actions,
        allowedEventTypes,
        forbiddenAuthorities,
    });
}
