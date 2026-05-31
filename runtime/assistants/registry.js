import { EventTypes } from '@/core/events/eventTypes.js';
import { normalizeAssistantCapabilityV1 } from '@/core/contracts/assistantCapability.v1.js';

const RAW_ASSISTANT_REGISTRY = Object.freeze([
    {
        id: 'assistant.design',
        label: 'Design Assistant',
        perspectiveId: 'create',
        actions: ['recommend', 'generate', 'explain'],
    },
    {
        id: 'assistant.media',
        label: 'Media Assistant',
        perspectiveId: 'create',
        actions: ['recommend', 'generate', 'explain'],
    },
    {
        id: 'assistant.build',
        label: 'Build Assistant',
        perspectiveId: 'build',
        actions: ['recommend', 'generate', 'explain', 'automate', 'execute-approved-workflow'],
    },
    {
        id: 'assistant.operations',
        label: 'Operations Assistant',
        perspectiveId: 'operate',
        actions: ['recommend', 'generate', 'explain', 'automate', 'execute-approved-workflow'],
    },
    {
        id: 'assistant.knowledge',
        label: 'Knowledge Assistant',
        perspectiveId: 'collaborate',
        actions: ['recommend', 'generate', 'explain'],
    },
    {
        id: 'assistant.publish',
        label: 'Publishing Assistant',
        perspectiveId: 'publish',
        actions: ['recommend', 'generate', 'explain', 'automate', 'execute-approved-workflow'],
    },
]);

const NORMALIZED_ASSISTANT_REGISTRY = Object.freeze(
    RAW_ASSISTANT_REGISTRY.map((entry) =>
        normalizeAssistantCapabilityV1({
            ...entry,
            allowedEventTypes: [EventTypes.AI_REQUEST_ENQUEUE],
            forbiddenAuthorities: [
                'dispatcher-mutation-authority',
                'document-truth-authority',
                'runtime-truth-authority',
            ],
        }),
    ).sort((left, right) => left.id.localeCompare(right.id)),
);

const REGISTRY_BY_ID = Object.freeze(
    NORMALIZED_ASSISTANT_REGISTRY.reduce((acc, entry) => {
        acc[entry.id] = entry;
        return acc;
    }, {}),
);

export function listAssistantCapabilities() {
    return NORMALIZED_ASSISTANT_REGISTRY;
}

export function getAssistantCapabilityById(assistantId) {
    const normalized = String(assistantId ?? '').trim();
    if (!normalized) return null;
    return REGISTRY_BY_ID[normalized] ?? null;
}

export function listAssistantCapabilitiesForPerspective(perspectiveId) {
    const normalizedPerspective = String(perspectiveId ?? '').trim().toLowerCase();
    if (!normalizedPerspective) return Object.freeze([]);
    return Object.freeze(
        NORMALIZED_ASSISTANT_REGISTRY.filter((entry) => entry.perspectiveId === normalizedPerspective),
    );
}
