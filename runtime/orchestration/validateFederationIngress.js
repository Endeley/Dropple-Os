import { EventTypes } from '@/core/events/eventTypes.js';

function fail(reason, details = {}) {
    throw new Error(
        JSON.stringify({
            scope: 'orchestration-federation-ingress',
            reason,
            details,
        }),
    );
}

function assertIngress(condition, reason, details = {}) {
    if (condition) return;
    fail(reason, details);
}

function canonicalSessionId(value) {
    return String(value ?? '').trim();
}

function canonicalSignature(value) {
    return String(value ?? '').trim();
}

function canonicalAuthority(authority = null) {
    return {
        ownerId: String(authority?.ownerId ?? '').trim(),
        mode: String(authority?.mode ?? '').trim(),
    };
}

function isSupportedType(type) {
    return (
        type === EventTypes.COLLABORATION_FEDERATION_SESSION_BEGIN ||
        type === EventTypes.COLLABORATION_FEDERATION_SESSION_PREVIEW ||
        type === EventTypes.COLLABORATION_FEDERATION_SESSION_COMMIT ||
        type === EventTypes.COLLABORATION_FEDERATION_SESSION_CLOSE
    );
}

export function validateFederationIngress(event = {}, sessionRecord = null) {
    const type = String(event?.type ?? '').trim();
    assertIngress(type.length > 0, 'INVALID_EVENT_TYPE', { eventType: event?.type ?? null });
    assertIngress(isSupportedType(type), 'UNSUPPORTED_EVENT_TYPE', { eventType: type });

    const payload = event?.payload && typeof event.payload === 'object' ? event.payload : {};
    const sessionId = canonicalSessionId(payload.sessionId);
    assertIngress(sessionId.length > 0, 'INVALID_SESSION_ID', { sessionId: payload.sessionId ?? null });

    const existing = sessionRecord && typeof sessionRecord === 'object' ? sessionRecord : null;
    const phase = String(existing?.envelope?.phase ?? '');

    if (type === EventTypes.COLLABORATION_FEDERATION_SESSION_BEGIN) {
        assertIngress(existing === null, 'SESSION_ALREADY_EXISTS', { sessionId });
        const sessionType = String(payload.sessionType ?? '').trim();
        assertIngress(sessionType.length > 0, 'INVALID_SESSION_TYPE', { sessionType: payload.sessionType ?? null });
        const authority = canonicalAuthority(payload.authority ?? null);
        assertIngress(authority.mode === 'coordination-only', 'INVALID_AUTHORITY_MODE', {
            mode: authority.mode || null,
        });
        return Object.freeze({
            ...event,
            payload: {
                ...payload,
                sessionId,
                sessionType,
                authority,
            },
        });
    }

    assertIngress(existing !== null, 'SESSION_NOT_FOUND', { sessionId });

    const expectedCheckpointSignature = canonicalSignature(payload.expectedCheckpointSignature);
    assertIngress(expectedCheckpointSignature.length > 0, 'MISSING_CHECKPOINT_SIGNATURE', {
        sessionId,
        eventType: type,
    });

    if (type === EventTypes.COLLABORATION_FEDERATION_SESSION_PREVIEW) {
        assertIngress(phase === 'created' || phase === 'preview', 'INVALID_PHASE_TRANSITION', {
            sessionId,
            phase,
            target: 'preview',
        });
    }

    if (type === EventTypes.COLLABORATION_FEDERATION_SESSION_COMMIT) {
        assertIngress(phase === 'created' || phase === 'preview', 'INVALID_PHASE_TRANSITION', {
            sessionId,
            phase,
            target: 'committed',
        });
    }

    if (type === EventTypes.COLLABORATION_FEDERATION_SESSION_CLOSE) {
        assertIngress(phase === 'created' || phase === 'preview' || phase === 'committed', 'INVALID_PHASE_TRANSITION', {
            sessionId,
            phase,
            target: 'closed',
        });
    }

    return Object.freeze({
        ...event,
        payload: {
            ...payload,
            sessionId,
            expectedCheckpointSignature,
        },
    });
}

