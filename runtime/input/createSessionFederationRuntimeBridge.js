import { assertFederationInvariant } from '@/runtime/orchestration/sessionFederation.js';
import {
    beginFederationSessionAction,
    closeFederationSessionAction,
    commitFederationSessionAction,
    updateFederationPreviewAction,
} from '@/runtime/orchestration/sessionFederationActions.js';
import { validateFederationIngress } from '@/runtime/orchestration/validateFederationIngress.js';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import {
    createFederationAuditEntry,
    createFederationAuditHash,
    createFederationSessionFingerprint,
} from '@/runtime/orchestration/federationAudit.js';

let federationRuntimeState = undefined;
let federationAuditEntries = [];

function mirrorLatestAuditEntry(dispatcher, maxEntries = 256) {
    if (!dispatcher || typeof dispatcher.dispatch !== 'function') return;
    const latest = federationAuditEntries[federationAuditEntries.length - 1] ?? null;
    if (!latest) return;
    dispatcher.dispatch({
        type: EventTypes.FEDERATION_AUDIT_APPEND,
        payload: {
            entry: latest,
            maxEntries,
        },
    });
}

function toFiniteNumber(value) {
    return Number.isFinite(value) ? Number(value) : null;
}

function cloneBounds(bounds) {
    if (!bounds || typeof bounds !== 'object') return null;
    const x = toFiniteNumber(bounds.x);
    const y = toFiniteNumber(bounds.y);
    const width = toFiniteNumber(bounds.width);
    const height = toFiniteNumber(bounds.height);
    if (x === null || y === null || width === null || height === null) return null;
    return { x, y, width, height };
}

function getSessionRecord(sessionId) {
    return federationRuntimeState?.collaboration?.federation?.sessions?.[sessionId] ?? null;
}

function applyFederationAction(event) {
    const payloadSessionId = String(event?.payload?.sessionId ?? '').trim();
    const existing = payloadSessionId ? getSessionRecord(payloadSessionId) : null;
    const beforeSignature = String(existing?.checkpoint?.checkpointSignature ?? '');
    const phaseBefore = String(existing?.envelope?.phase ?? '');
    const epochBefore = Number.isFinite(existing?.envelope?.commitEpoch) ? Number(existing.envelope.commitEpoch) : 0;

    try {
        const validatedEvent = validateFederationIngress(event, existing);
        federationRuntimeState = replayEvents({
            events: [validatedEvent],
            initialState: federationRuntimeState,
        });
        const next = payloadSessionId ? getSessionRecord(payloadSessionId) : null;
        federationAuditEntries.push(
            createFederationAuditEntry({
                eventType: validatedEvent?.type,
                sessionId: payloadSessionId || 'unknown',
                outcome: 'accepted',
                reason: 'ingress-accepted',
                beforeSignature,
                afterSignature: String(next?.checkpoint?.checkpointSignature ?? ''),
                phaseBefore,
                phaseAfter: String(next?.envelope?.phase ?? ''),
                epochBefore,
                epochAfter: Number.isFinite(next?.envelope?.commitEpoch) ? Number(next.envelope.commitEpoch) : 0,
            }),
        );
    } catch (error) {
        let reason = 'ingress-rejected';
        try {
            const parsed = JSON.parse(String(error?.message ?? '{}'));
            reason = String(parsed?.reason ?? reason);
        } catch {}
        federationAuditEntries.push(
            createFederationAuditEntry({
                eventType: event?.type,
                sessionId: payloadSessionId || 'unknown',
                outcome: 'rejected',
                reason,
                beforeSignature,
                afterSignature: beforeSignature,
                phaseBefore,
                phaseAfter: phaseBefore,
                epochBefore,
                epochAfter: epochBefore,
            }),
        );
        throw error;
    }
}

function createSnapshot(sessionId) {
    const record = getSessionRecord(sessionId);
    assertFederationInvariant(record !== null, 'SESSION_NOT_REGISTERED', { sessionId });
    return {
        envelope: {
            ...record.envelope,
            participants: [...(record.envelope?.participants ?? [])],
            authority: record.envelope?.authority ? { ...record.envelope.authority } : null,
        },
        checkpoint: record.checkpoint ? { ...record.checkpoint } : null,
        previewBounds: record.previewBounds ? { ...record.previewBounds } : null,
    };
}

export function beginCreateSessionFederationRuntime({
    sessionId,
    pointerId,
    tool = null,
    nodeType = null,
    dispatcher = null,
} = {}) {
    assertFederationInvariant(
        typeof sessionId === 'string' && sessionId.length > 0,
        'INVALID_SESSION_ID',
        { sessionId: sessionId ?? null },
    );
    assertFederationInvariant(getSessionRecord(sessionId) === null, 'SESSION_ALREADY_REGISTERED', { sessionId });

    applyFederationAction(
        beginFederationSessionAction({
            sessionId,
            sessionType: 'create',
            authority: {
                ownerId: 'runtime:create-session',
                mode: 'coordination-only',
            },
            participants: [
                Number.isFinite(pointerId) ? `pointer:${pointerId}` : null,
                typeof tool === 'string' && tool.length > 0 ? `tool:${tool}` : null,
                typeof nodeType === 'string' && nodeType.length > 0 ? `node:${nodeType}` : null,
            ].filter(Boolean),
        }),
    );
    mirrorLatestAuditEntry(dispatcher);

    return createSnapshot(sessionId);
}

export function updateCreateSessionFederationPreviewRuntime({ sessionId, bounds, dispatcher = null } = {}) {
    const record = getSessionRecord(sessionId);
    assertFederationInvariant(record !== null, 'SESSION_NOT_REGISTERED', { sessionId });
    assertFederationInvariant(record.envelope?.phase !== 'closed', 'SESSION_ALREADY_CLOSED', { sessionId });

    applyFederationAction(
        updateFederationPreviewAction({
            sessionId,
            bounds: cloneBounds(bounds),
            expectedCheckpointSignature: record.checkpoint?.checkpointSignature ?? null,
        }),
    );
    mirrorLatestAuditEntry(dispatcher);
    return createSnapshot(sessionId);
}

export function sealCreateSessionFederationCommitRuntime({ sessionId, dispatcher = null } = {}) {
    const record = getSessionRecord(sessionId);
    assertFederationInvariant(record !== null, 'SESSION_NOT_REGISTERED', { sessionId });

    applyFederationAction(
        commitFederationSessionAction({
            sessionId,
            expectedCheckpointSignature: record.checkpoint?.checkpointSignature ?? null,
        }),
    );
    mirrorLatestAuditEntry(dispatcher);
    return createSnapshot(sessionId);
}

export function closeCreateSessionFederationRuntime({ sessionId, dispatcher = null } = {}) {
    const record = getSessionRecord(sessionId);
    assertFederationInvariant(record !== null, 'SESSION_NOT_REGISTERED', { sessionId });

    applyFederationAction(
        closeFederationSessionAction({
            sessionId,
            expectedCheckpointSignature: record.checkpoint?.checkpointSignature ?? null,
        }),
    );
    mirrorLatestAuditEntry(dispatcher);
    assertFederationInvariant(getSessionRecord(sessionId) === null, 'SESSION_NOT_RELEASED', {
        sessionId,
    });
    return {
        sessionId,
        released: true,
    };
}

export function getCreateSessionFederationSnapshotRuntime(sessionId) {
    const record = getSessionRecord(sessionId);
    if (!record) return null;
    return createSnapshot(sessionId);
}

export function dispatchFederationIngressRuntime(event = {}, { dispatcher = null, maxEntries = 256 } = {}) {
    try {
        applyFederationAction(event);
    } catch (error) {
        mirrorLatestAuditEntry(dispatcher, maxEntries);
        throw error;
    }
    mirrorLatestAuditEntry(dispatcher, maxEntries);
    const sessionId = String(event?.payload?.sessionId ?? '').trim();
    if (!sessionId) return null;
    const record = getSessionRecord(sessionId);
    if (!record) return null;
    return createSnapshot(sessionId);
}

export function resetCreateSessionFederationRuntimeForTests() {
    federationRuntimeState = undefined;
    federationAuditEntries = [];
}

export function getCreateSessionFederationAuditRuntime() {
    return federationAuditEntries.map((entry) => ({
        ...entry,
        payload: { ...(entry?.payload ?? {}) },
    }));
}

export function getCreateSessionFederationAuditHashRuntime() {
    return createFederationAuditHash(federationAuditEntries);
}

export function getCreateSessionFederationFingerprintRuntime(sessionId) {
    const snapshot = getCreateSessionFederationSnapshotRuntime(sessionId);
    return createFederationSessionFingerprint(snapshot);
}
