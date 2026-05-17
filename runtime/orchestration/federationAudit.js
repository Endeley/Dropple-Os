import { createFederationAuditHash } from '@/core/collaboration/federationAuditState.js';

export { createFederationAuditHash };

function normalizeString(value, fallback = '') {
    const normalized = typeof value === 'string' ? value.trim() : '';
    return normalized || fallback;
}

function normalizeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeParticipants(participants) {
    if (!Array.isArray(participants)) return Object.freeze([]);
    return Object.freeze(
        Array.from(
            new Set(
                participants
                    .filter((participant) => typeof participant === 'string')
                    .map((participant) => participant.trim())
                    .filter(Boolean),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

export function createFederationAuditEntry({
    eventType,
    sessionId,
    outcome = 'accepted',
    reason = '',
    beforeSignature = '',
    afterSignature = '',
    phaseBefore = '',
    phaseAfter = '',
    epochBefore = 0,
    epochAfter = 0,
} = {}) {
    return Object.freeze({
        type: 'runtime.federation.audit',
        payload: Object.freeze({
            eventType: normalizeString(eventType, 'unknown'),
            sessionId: normalizeString(sessionId, 'unknown'),
            outcome: normalizeString(outcome, 'accepted'),
            reason: normalizeString(reason, 'none'),
            beforeSignature: normalizeString(beforeSignature, ''),
            afterSignature: normalizeString(afterSignature, ''),
            phaseBefore: normalizeString(phaseBefore, ''),
            phaseAfter: normalizeString(phaseAfter, ''),
            epochBefore: normalizeNumber(epochBefore, 0),
            epochAfter: normalizeNumber(epochAfter, 0),
        }),
    });
}

export function createFederationSessionFingerprint(snapshot = null) {
    const envelope = snapshot?.envelope ?? null;
    return createFederationAuditHash([
        {
            type: 'runtime.federation.audit',
            payload: {
        sessionId: normalizeString(envelope?.sessionId, ''),
                eventType: normalizeString(envelope?.sessionType, 'unknown'),
                outcome: normalizeString(envelope?.phase, ''),
                reason: normalizeString(envelope?.checkpointSignature, ''),
                beforeSignature: JSON.stringify(normalizeParticipants(envelope?.participants ?? [])),
                afterSignature: JSON.stringify({
                    ownerId: normalizeString(envelope?.authority?.ownerId, ''),
                    mode: normalizeString(envelope?.authority?.mode, ''),
                    previewBounds:
                        snapshot?.previewBounds && typeof snapshot.previewBounds === 'object'
                            ? {
                                  x: normalizeNumber(snapshot.previewBounds.x, 0),
                                  y: normalizeNumber(snapshot.previewBounds.y, 0),
                                  width: normalizeNumber(snapshot.previewBounds.width, 0),
                                  height: normalizeNumber(snapshot.previewBounds.height, 0),
                              }
                            : null,
                }),
                phaseBefore: normalizeString(envelope?.sessionType, ''),
                phaseAfter: normalizeString(envelope?.phase, ''),
                epochBefore: normalizeNumber(envelope?.commitEpoch, 0),
                epochAfter: normalizeNumber(envelope?.commitEpoch, 0),
            },
        },
    ]);
}
