import test from 'node:test';
import assert from 'node:assert/strict';

import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import {
    beginCreateSessionFederationRuntime,
    dispatchFederationIngressRuntime,
    closeCreateSessionFederationRuntime,
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
});
