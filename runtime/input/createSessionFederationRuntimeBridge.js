import {
    assertFederationInvariant,
    createFederatedSessionEnvelope,
    transitionFederatedSession,
} from '@/runtime/orchestration/sessionFederation.js';

const createSessionFederationRegistry = new Map();

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

function getRequiredRecord(sessionId) {
    const record = createSessionFederationRegistry.get(sessionId) ?? null;
    assertFederationInvariant(record !== null, 'SESSION_NOT_REGISTERED', { sessionId });
    return record;
}

function createSnapshot(record) {
    return {
        envelope: { ...record.envelope, participants: [...(record.envelope.participants ?? [])] },
        previewBounds: record.previewBounds ? { ...record.previewBounds } : null,
    };
}

export function beginCreateSessionFederationRuntime({
    sessionId,
    pointerId,
    tool = null,
    nodeType = null,
} = {}) {
    assertFederationInvariant(
        typeof sessionId === 'string' && sessionId.length > 0,
        'INVALID_SESSION_ID',
        { sessionId: sessionId ?? null },
    );
    assertFederationInvariant(
        !createSessionFederationRegistry.has(sessionId),
        'SESSION_ALREADY_REGISTERED',
        { sessionId },
    );

    const envelope = createFederatedSessionEnvelope({
        sessionId,
        sessionType: 'create',
        participants: [
            Number.isFinite(pointerId) ? `pointer:${pointerId}` : null,
            typeof tool === 'string' && tool.length > 0 ? `tool:${tool}` : null,
            typeof nodeType === 'string' && nodeType.length > 0 ? `node:${nodeType}` : null,
        ].filter(Boolean),
        phase: 'created',
        commitEpoch: 0,
    });

    const record = {
        envelope,
        previewBounds: null,
    };
    createSessionFederationRegistry.set(sessionId, record);
    return createSnapshot(record);
}

export function updateCreateSessionFederationPreviewRuntime({ sessionId, bounds } = {}) {
    const record = getRequiredRecord(sessionId);
    assertFederationInvariant(record.envelope.phase !== 'closed', 'SESSION_ALREADY_CLOSED', {
        sessionId,
    });
    record.previewBounds = cloneBounds(bounds);
    if (record.envelope.phase === 'created') {
        record.envelope = {
            ...record.envelope,
            phase: 'preview',
        };
    }
    return createSnapshot(record);
}

export function sealCreateSessionFederationCommitRuntime({ sessionId } = {}) {
    const record = getRequiredRecord(sessionId);
    record.envelope = transitionFederatedSession(record.envelope, { type: 'seal-commit' });
    return createSnapshot(record);
}

export function closeCreateSessionFederationRuntime({ sessionId } = {}) {
    const record = getRequiredRecord(sessionId);
    record.envelope = transitionFederatedSession(record.envelope, { type: 'close-session' });
    createSessionFederationRegistry.delete(sessionId);
    assertFederationInvariant(!createSessionFederationRegistry.has(sessionId), 'SESSION_NOT_RELEASED', {
        sessionId,
    });
    return {
        sessionId,
        released: true,
    };
}

export function getCreateSessionFederationSnapshotRuntime(sessionId) {
    const record = createSessionFederationRegistry.get(sessionId) ?? null;
    return record ? createSnapshot(record) : null;
}

export function resetCreateSessionFederationRuntimeForTests() {
    createSessionFederationRegistry.clear();
}

