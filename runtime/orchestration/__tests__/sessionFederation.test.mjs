import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assertFederationInvariant,
    createFederatedSessionEnvelope,
    transitionFederatedSession,
} from '@/runtime/orchestration/sessionFederation.js';

test('createFederatedSessionEnvelope canonicalizes participants deterministically', () => {
    const envelope = createFederatedSessionEnvelope({
        sessionId: 'sess-1',
        sessionType: 'create',
        participants: ['peer-b', 'peer-a', 'peer-a', ''],
    });

    assert.deepEqual(envelope.participants, ['peer-a', 'peer-b']);
    assert.equal(envelope.phase, 'created');
    assert.equal(envelope.commitEpoch, 0);
});

test('transitionFederatedSession applies deterministic lifecycle transitions', () => {
    const initial = createFederatedSessionEnvelope({
        sessionId: 'sess-2',
        participants: ['peer-a'],
    });

    const attached = transitionFederatedSession(initial, {
        type: 'attach-participant',
        participantId: 'peer-b',
    });
    assert.deepEqual(attached.participants, ['peer-a', 'peer-b']);

    const committed = transitionFederatedSession(attached, { type: 'seal-commit' });
    assert.equal(committed.phase, 'committed');
    assert.equal(committed.commitEpoch, 1);

    const closed = transitionFederatedSession(committed, { type: 'close-session' });
    assert.equal(closed.phase, 'closed');
    assert.deepEqual(closed.participants, []);
});

test('transitionFederatedSession rejects unsupported events deterministically', () => {
    const envelope = createFederatedSessionEnvelope({ sessionId: 'sess-3' });

    assert.throws(
        () => transitionFederatedSession(envelope, { type: 'unknown' }),
        /"reason":"UNSUPPORTED_EVENT_TYPE"/,
    );
});

test('assertFederationInvariant fails with deterministic payload', () => {
    assert.throws(
        () => assertFederationInvariant(false, 'INVARIANT_FAILED', { sessionId: 'sess-4' }),
        /"scope":"orchestration-session-federation"/,
    );
});

