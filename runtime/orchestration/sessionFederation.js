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

    return {
        sessionId,
        sessionType,
        phase,
        commitEpoch,
        participants: toCanonicalParticipantSet(participants),
    };
}

export function transitionFederatedSession(envelope, event = {}) {
    assertFederationInvariant(envelope && typeof envelope === 'object', 'INVALID_ENVELOPE', {
        envelopeType: typeof envelope,
    });
    const { type, participantId } = event;
    assertFederationInvariant(typeof type === 'string' && type.length > 0, 'INVALID_EVENT_TYPE', {
        eventType: type ?? null,
    });

    const next = {
        ...envelope,
        participants: [...(envelope.participants ?? [])],
    };

    if (type === 'attach-participant') {
        const canonicalId = toCanonicalParticipantId(participantId);
        assertFederationInvariant(canonicalId.length > 0, 'INVALID_PARTICIPANT_ID', {
            participantId: participantId ?? null,
        });
        next.participants = toCanonicalParticipantSet([...next.participants, canonicalId]);
        return next;
    }

    if (type === 'detach-participant') {
        const canonicalId = toCanonicalParticipantId(participantId);
        assertFederationInvariant(canonicalId.length > 0, 'INVALID_PARTICIPANT_ID', {
            participantId: participantId ?? null,
        });
        next.participants = next.participants.filter((id) => id !== canonicalId);
        return next;
    }

    if (type === 'seal-commit') {
        assertFederationInvariant(next.phase !== 'closed', 'SESSION_ALREADY_CLOSED', {
            sessionId: next.sessionId,
        });
        next.phase = 'committed';
        next.commitEpoch = next.commitEpoch + 1;
        return next;
    }

    if (type === 'close-session') {
        next.phase = 'closed';
        next.participants = [];
        return next;
    }

    fail('UNSUPPORTED_EVENT_TYPE', {
        eventType: type,
    });
}

