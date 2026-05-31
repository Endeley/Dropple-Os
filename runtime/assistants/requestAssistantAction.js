import { EventTypes } from '@/core/events/eventTypes.js';
import { createUuid } from '@/core/utils/createUuid.js';
import { getAssistantCapabilityById } from '@/runtime/assistants/registry.js';

function assertDispatcher(dispatcher) {
    if (!dispatcher || typeof dispatcher.dispatch !== 'function') {
        throw new Error('assistant request routing requires an injected dispatcher');
    }
}

function normalizeAssistantActionEnvelope({ assistantCapability, action, input = null, metadata = null, requestId = null }) {
    const normalizedAction = String(action ?? '').trim();
    if (!assistantCapability.actions.includes(normalizedAction)) {
        throw new Error(`assistant action is not allowed for ${assistantCapability.id}: ${normalizedAction || 'unknown'}`);
    }

    return {
        id: requestId ?? createUuid(),
        kind: 'assistant-action',
        status: 'running',
        input: input && typeof input === 'object' ? { ...input } : input,
        metadata: {
            ...(metadata && typeof metadata === 'object' ? metadata : {}),
            assistantId: assistantCapability.id,
            assistantLabel: assistantCapability.label,
            perspectiveId: assistantCapability.perspectiveId,
            action: normalizedAction,
            schemaVersion: assistantCapability.schemaVersion,
        },
        result: null,
        error: null,
        startedAt: Date.now(),
        completedAt: null,
    };
}

export async function requestAssistantAction({
    dispatcher,
    assistantId,
    action,
    input = null,
    metadata = null,
    requestId = null,
} = {}) {
    assertDispatcher(dispatcher);

    const assistantCapability = getAssistantCapabilityById(assistantId);
    if (!assistantCapability) {
        throw new Error(`unknown assistant capability: ${String(assistantId ?? '') || 'none'}`);
    }

    if (!assistantCapability.allowedEventTypes.includes(EventTypes.AI_REQUEST_ENQUEUE)) {
        throw new Error(`assistant capability disallows event routing: ${assistantCapability.id}`);
    }

    const request = normalizeAssistantActionEnvelope({
        assistantCapability,
        action,
        input,
        metadata,
        requestId,
    });

    await dispatcher.dispatch({
        type: EventTypes.AI_REQUEST_ENQUEUE,
        payload: {
            request,
        },
    });

    return Object.freeze({
        requestId: request.id,
        assistantId: assistantCapability.id,
        perspectiveId: assistantCapability.perspectiveId,
        action: request.metadata.action,
        eventType: EventTypes.AI_REQUEST_ENQUEUE,
    });
}
