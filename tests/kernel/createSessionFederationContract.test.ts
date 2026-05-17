import test from 'node:test';
import assert from 'node:assert/strict';

import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import {
    beginCreateSessionFederationRuntime,
    dispatchFederationIngressRuntime,
    closeCreateSessionFederationRuntime,
    getCreateSessionFederationAuditHashRuntime,
    getCreateSessionFederationAuditRuntime,
    getCreateSessionFederationFingerprintRuntime,
    resetCreateSessionFederationRuntimeForTests,
    sealCreateSessionFederationCommitRuntime,
    updateCreateSessionFederationPreviewRuntime,
} from '@/runtime/input/createSessionFederationRuntimeBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('create-session federation lifecycle is deterministic and closed', () => {
    resetCreateSessionFederationRuntimeForTests();

    const started = beginCreateSessionFederationRuntime({
        sessionId: 'frame:kernel-1',
        pointerId: 7,
        tool: 'frame',
        nodeType: 'frame',
    });
    assert.equal(started.envelope.phase, 'created');

    const preview = updateCreateSessionFederationPreviewRuntime({
        sessionId: 'frame:kernel-1',
        bounds: { x: 10, y: 20, width: 120, height: 80 },
    });
    assert.equal(preview.envelope.phase, 'preview');

    const committed = sealCreateSessionFederationCommitRuntime({
        sessionId: 'frame:kernel-1',
    });
    assert.equal(committed.envelope.phase, 'committed');
    assert.equal(committed.envelope.commitEpoch, 1);

    const closed = closeCreateSessionFederationRuntime({
        sessionId: 'frame:kernel-1',
    });
    assert.equal(closed.released, true);
});

test('create-session federation is coordination-only and does not mutate runtime truth', () => {
    resetCreateSessionFederationRuntimeForTests();

    const before = getRuntimeState();

    beginCreateSessionFederationRuntime({
        sessionId: 'frame:kernel-2',
        pointerId: 3,
        tool: 'frame',
        nodeType: 'frame',
    });
    updateCreateSessionFederationPreviewRuntime({
        sessionId: 'frame:kernel-2',
        bounds: { x: 0, y: 0, width: 50, height: 40 },
    });
    sealCreateSessionFederationCommitRuntime({ sessionId: 'frame:kernel-2' });
    closeCreateSessionFederationRuntime({ sessionId: 'frame:kernel-2' });

    const after = getRuntimeState();
    assert.deepEqual(after, before);
});

test('federation ingress reject is coordination-only and does not mutate runtime truth', () => {
    resetCreateSessionFederationRuntimeForTests();

    const before = getRuntimeState();

    assert.throws(
        () =>
            dispatchFederationIngressRuntime({
                type: EventTypes.COLLABORATION_FEDERATION_SESSION_COMMIT,
                payload: {
                    sessionId: 'foreign-session',
                    expectedCheckpointSignature: 'sig',
                },
            }),
        /"reason":"SESSION_NOT_FOUND"/,
    );

    const after = getRuntimeState();
    assert.deepEqual(after, before);
    const audit = getCreateSessionFederationAuditRuntime();
    assert.equal(audit.length, 1);
    assert.equal(audit[0]?.payload?.outcome, 'rejected');
});

test('identical federation event streams yield identical audit hash', () => {
    resetCreateSessionFederationRuntimeForTests();
    beginCreateSessionFederationRuntime({
        sessionId: 'frame:kernel-hash',
        pointerId: 1,
        tool: 'frame',
        nodeType: 'frame',
    });
    updateCreateSessionFederationPreviewRuntime({
        sessionId: 'frame:kernel-hash',
        bounds: { x: 1, y: 2, width: 3, height: 4 },
    });
    sealCreateSessionFederationCommitRuntime({ sessionId: 'frame:kernel-hash' });
    closeCreateSessionFederationRuntime({ sessionId: 'frame:kernel-hash' });
    const hashA = getCreateSessionFederationAuditHashRuntime();

    resetCreateSessionFederationRuntimeForTests();
    beginCreateSessionFederationRuntime({
        sessionId: 'frame:kernel-hash',
        pointerId: 1,
        tool: 'frame',
        nodeType: 'frame',
    });
    updateCreateSessionFederationPreviewRuntime({
        sessionId: 'frame:kernel-hash',
        bounds: { x: 1, y: 2, width: 3, height: 4 },
    });
    sealCreateSessionFederationCommitRuntime({ sessionId: 'frame:kernel-hash' });
    closeCreateSessionFederationRuntime({ sessionId: 'frame:kernel-hash' });
    const hashB = getCreateSessionFederationAuditHashRuntime();

    assert.equal(hashA, hashB);
});

test('resumed federation lifecycle fingerprint matches uninterrupted lifecycle', () => {
    resetCreateSessionFederationRuntimeForTests();
    beginCreateSessionFederationRuntime({
        sessionId: 'frame:kernel-fp',
        pointerId: 5,
        tool: 'frame',
        nodeType: 'frame',
    });
    updateCreateSessionFederationPreviewRuntime({
        sessionId: 'frame:kernel-fp',
        bounds: { x: 10, y: 20, width: 30, height: 40 },
    });
    const uninterruptedFingerprint = getCreateSessionFederationFingerprintRuntime('frame:kernel-fp');

    resetCreateSessionFederationRuntimeForTests();
    beginCreateSessionFederationRuntime({
        sessionId: 'frame:kernel-fp',
        pointerId: 5,
        tool: 'frame',
        nodeType: 'frame',
    });
    // resume point: same canonical preview update after restart
    updateCreateSessionFederationPreviewRuntime({
        sessionId: 'frame:kernel-fp',
        bounds: { x: 10, y: 20, width: 30, height: 40 },
    });
    const resumedFingerprint = getCreateSessionFederationFingerprintRuntime('frame:kernel-fp');

    assert.equal(resumedFingerprint, uninterruptedFingerprint);
});
