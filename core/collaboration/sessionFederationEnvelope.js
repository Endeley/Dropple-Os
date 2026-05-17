function toCanonicalParticipantId(value) {
    return String(value ?? '').trim();
}

function toCanonicalParticipantSet(participants = []) {
    const unique = new Set();
    for (const participantId of participants) {
        const canonicalId = toCanonicalParticipantId(participantId);
        if (!canonicalId) continue;
        unique.add(canonicalId);
    }
    return [...unique].sort((left, right) => left.localeCompare(right));
}

function fail(reason, details = {}) {
    throw new Error(
        JSON.stringify({
            scope: 'orchestration-session-federation',
            reason,
            details,
        }),
    );
}

function toCanonicalAuthority(authority = null) {
    const ownerId = String(authority?.ownerId ?? 'runtime:local').trim() || 'runtime:local';
    const mode = String(authority?.mode ?? 'coordination-only').trim() || 'coordination-only';
    return Object.freeze({
        ownerId,
        mode,
    });
}

function toCheckpointSignature(envelope = {}) {
    return JSON.stringify({
        sessionId: String(envelope.sessionId ?? ''),
        sessionType: String(envelope.sessionType ?? ''),
        phase: String(envelope.phase ?? ''),
        commitEpoch: Number.isFinite(envelope.commitEpoch) ? Number(envelope.commitEpoch) : 0,
        participants: toCanonicalParticipantSet(envelope.participants ?? []),
        authority: toCanonicalAuthority(envelope.authority ?? null),
    });
}

export function assertFederationInvariant(condition, reason, details = {}) {
    if (condition) return;
    fail(reason, details);
}

export function createFederatedSessionEnvelope({
    sessionId,
    sessionType = 'create',
    participants = [],
    phase = 'created',
    commitEpoch = 0,
    authority = null,
} = {}) {
    assertFederationInvariant(typeof sessionId === 'string' && sessionId.length > 0, 'INVALID_SESSION_ID', {
        sessionId: sessionId ?? null,
    });
    assertFederationInvariant(typeof sessionType === 'string' && sessionType.length > 0, 'INVALID_SESSION_TYPE', {
        sessionType: sessionType ?? null,
    });
    assertFederationInvariant(Number.isInteger(commitEpoch) && commitEpoch >= 0, 'INVALID_COMMIT_EPOCH', {
        commitEpoch: commitEpoch ?? null,
    });

    const base = {
        sessionId,
        sessionType,
        phase,
        commitEpoch,
        participants: toCanonicalParticipantSet(participants),
        authority: toCanonicalAuthority(authority),
    };
    return {
        ...base,
        checkpointSignature: toCheckpointSignature(base),
    };
}

export function transitionFederatedSession(envelope, event = {}) {
    assertFederationInvariant(envelope && typeof envelope === 'object', 'INVALID_ENVELOPE', {
        envelopeType: typeof envelope,
    });
    const { type, participantId, expectedCheckpointSignature = null } = event;
    assertFederationInvariant(typeof type === 'string' && type.length > 0, 'INVALID_EVENT_TYPE', {
        eventType: type ?? null,
    });

    const next = {
        ...envelope,
        participants: [...(envelope.participants ?? [])],
        authority: toCanonicalAuthority(envelope.authority ?? null),
    };
    if (expectedCheckpointSignature !== null && expectedCheckpointSignature !== undefined) {
        assertFederationInvariant(
            String(expectedCheckpointSignature) === String(envelope.checkpointSignature ?? ''),
            'STALE_FEDERATION_EVENT',
            {
                expectedCheckpointSignature: String(expectedCheckpointSignature),
                checkpointSignature: String(envelope.checkpointSignature ?? ''),
                eventType: type,
            },
        );
    }

    if (type === 'attach-participant') {
        const canonicalId = toCanonicalParticipantId(participantId);
        assertFederationInvariant(canonicalId.length > 0, 'INVALID_PARTICIPANT_ID', {
            participantId: participantId ?? null,
        });
        next.participants = toCanonicalParticipantSet([...next.participants, canonicalId]);
        return {
            ...next,
            checkpointSignature: toCheckpointSignature(next),
        };
    }

    if (type === 'detach-participant') {
        const canonicalId = toCanonicalParticipantId(participantId);
        assertFederationInvariant(canonicalId.length > 0, 'INVALID_PARTICIPANT_ID', {
            participantId: participantId ?? null,
        });
        next.participants = next.participants.filter((id) => id !== canonicalId);
        return {
            ...next,
            checkpointSignature: toCheckpointSignature(next),
        };
    }

    if (type === 'seal-commit') {
        assertFederationInvariant(next.phase !== 'closed', 'SESSION_ALREADY_CLOSED', {
            sessionId: next.sessionId,
        });
        assertFederationInvariant(next.phase !== 'committed', 'COMMIT_ALREADY_FINALIZED', {
            sessionId: next.sessionId,
        });
        next.phase = 'committed';
        next.commitEpoch = next.commitEpoch + 1;
        return {
            ...next,
            checkpointSignature: toCheckpointSignature(next),
        };
    }

    if (type === 'set-preview') {
        assertFederationInvariant(next.phase !== 'closed', 'SESSION_ALREADY_CLOSED', {
            sessionId: next.sessionId,
        });
        if (next.phase === 'created') {
            next.phase = 'preview';
        }
        return {
            ...next,
            checkpointSignature: toCheckpointSignature(next),
        };
    }

    if (type === 'close-session') {
        next.phase = 'closed';
        next.participants = [];
        return {
            ...next,
            checkpointSignature: toCheckpointSignature(next),
        };
    }

    fail('UNSUPPORTED_EVENT_TYPE', {
        eventType: type,
    });
}

export function createFederatedSessionCheckpoint(envelope = null) {
    assertFederationInvariant(envelope && typeof envelope === 'object', 'INVALID_ENVELOPE', {
        envelopeType: typeof envelope,
    });
    return Object.freeze({
        sessionId: String(envelope.sessionId ?? ''),
        commitEpoch: Number.isFinite(envelope.commitEpoch) ? Number(envelope.commitEpoch) : 0,
        checkpointSignature: String(envelope.checkpointSignature ?? ''),
    });
}

