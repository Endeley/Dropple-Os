import { EventTypes } from '@/core/events/eventTypes.js';

export function beginFederationSessionAction({
    sessionId,
    sessionType = 'create',
    participants = [],
    authority = null,
} = {}) {
    return Object.freeze({
        type: EventTypes.COLLABORATION_FEDERATION_SESSION_BEGIN,
        payload: {
            sessionId,
            sessionType,
            participants: Array.isArray(participants) ? [...participants] : [],
            authority,
        },
    });
}

export function updateFederationPreviewAction({
    sessionId,
    bounds = null,
    expectedCheckpointSignature = null,
} = {}) {
    return Object.freeze({
        type: EventTypes.COLLABORATION_FEDERATION_SESSION_PREVIEW,
        payload: {
            sessionId,
            bounds,
            expectedCheckpointSignature,
        },
    });
}

export function commitFederationSessionAction({
    sessionId,
    expectedCheckpointSignature = null,
} = {}) {
    return Object.freeze({
        type: EventTypes.COLLABORATION_FEDERATION_SESSION_COMMIT,
        payload: {
            sessionId,
            expectedCheckpointSignature,
        },
    });
}

export function closeFederationSessionAction({
    sessionId,
    expectedCheckpointSignature = null,
} = {}) {
    return Object.freeze({
        type: EventTypes.COLLABORATION_FEDERATION_SESSION_CLOSE,
        payload: {
            sessionId,
            expectedCheckpointSignature,
        },
    });
}

