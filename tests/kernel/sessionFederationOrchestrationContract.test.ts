import test from 'node:test';
import assert from 'node:assert/strict';

import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';
import {
    beginFederationSessionAction,
    closeFederationSessionAction,
    commitFederationSessionAction,
    updateFederationPreviewAction,
} from '@/runtime/orchestration/sessionFederationActions.js';

function getSession(state, sessionId) {
    return state?.collaboration?.federation?.sessions?.[sessionId] ?? null;
}

function applyEvent(state, event) {
    return replayEvents({
        initialState: state,
        events: [event],
    });
}

test('session federation reducer canonicalizes participants and evolves checkpoints deterministically', () => {
    const sessionId = 'federation:kernel:1';
    let state = applyEvent(undefined, beginFederationSessionAction({
        sessionId,
        participants: ['peer-b', 'peer-a', 'peer-a'],
        authority: { ownerId: 'runtime:test', mode: 'coordination-only' },
    }));

    const started = getSession(state, sessionId);
    assert.deepEqual(started.envelope.participants, ['peer-a', 'peer-b']);
    assert.equal(started.envelope.phase, 'created');
    assert.equal(started.envelope.commitEpoch, 0);
    const startedSig = started.checkpoint.checkpointSignature;

    state = applyEvent(
        state,
        updateFederationPreviewAction({
            sessionId,
            bounds: { x: 1, y: 2, width: 30, height: 40 },
            expectedCheckpointSignature: startedSig,
        }),
    );
    const preview = getSession(state, sessionId);
    assert.equal(preview.envelope.phase, 'preview');
    assert.notEqual(preview.checkpoint.checkpointSignature, startedSig);

    const previewSig = preview.checkpoint.checkpointSignature;
    state = applyEvent(
        state,
        commitFederationSessionAction({
            sessionId,
            expectedCheckpointSignature: previewSig,
        }),
    );
    const committed = getSession(state, sessionId);
    assert.equal(committed.envelope.phase, 'committed');
    assert.equal(committed.envelope.commitEpoch, 1);
    assert.notEqual(committed.checkpoint.checkpointSignature, previewSig);
});

test('session federation reducer fails closed on stale federation events', () => {
    const sessionId = 'federation:kernel:stale';
    let state = applyEvent(undefined, beginFederationSessionAction({ sessionId }));
    const session = getSession(state, sessionId);
    assert.ok(session);

    assert.throws(
        () =>
            applyEvent(
                state,
                commitFederationSessionAction({
                    sessionId,
                    expectedCheckpointSignature: 'stale-signature',
                }),
            ),
        /"reason":"STALE_FEDERATION_EVENT"/,
    );
});

test('session federation replay is equivalent across uninterrupted and resumed sequences', () => {
    const sessionId = 'federation:kernel:resume';
    const uninterruptedEvents = [];
    let baseline = applyEvent(undefined, beginFederationSessionAction({ sessionId, participants: ['peer-z', 'peer-a'] }));
    uninterruptedEvents.push(beginFederationSessionAction({ sessionId, participants: ['peer-z', 'peer-a'] }));

    const startedSig = getSession(baseline, sessionId).checkpoint.checkpointSignature;
    const previewEvent = updateFederationPreviewAction({
        sessionId,
        bounds: { x: 4, y: 5, width: 6, height: 7 },
        expectedCheckpointSignature: startedSig,
    });
    baseline = applyEvent(baseline, previewEvent);
    uninterruptedEvents.push(previewEvent);

    const previewSig = getSession(baseline, sessionId).checkpoint.checkpointSignature;
    const commitEvent = commitFederationSessionAction({
        sessionId,
        expectedCheckpointSignature: previewSig,
    });
    baseline = applyEvent(baseline, commitEvent);
    uninterruptedEvents.push(commitEvent);

    const committedSig = getSession(baseline, sessionId).checkpoint.checkpointSignature;
    const closeEvent = closeFederationSessionAction({
        sessionId,
        expectedCheckpointSignature: committedSig,
    });
    baseline = applyEvent(baseline, closeEvent);
    uninterruptedEvents.push(closeEvent);

    let resumed = applyEvent(undefined, uninterruptedEvents[0]);
    resumed = applyEvent(resumed, uninterruptedEvents[1]);
    resumed = applyEvent(resumed, uninterruptedEvents[2]);
    resumed = applyEvent(resumed, uninterruptedEvents[3]);

    assert.deepEqual(resumed, baseline);
    assert.deepEqual(getSession(resumed, sessionId), null);
});
