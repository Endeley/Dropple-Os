import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { createFederatedSessionEnvelope, createFederatedSessionCheckpoint } from '@/runtime/orchestration/sessionFederation.js';
import { validateFederationIngress } from '@/runtime/orchestration/validateFederationIngress.js';

function createRecord(phase = 'created') {
    const envelope = createFederatedSessionEnvelope({
        sessionId: 'sess-validate',
        sessionType: 'create',
        phase,
        commitEpoch: phase === 'committed' ? 1 : 0,
        authority: { ownerId: 'runtime:test', mode: 'coordination-only' },
    });
    return {
        envelope,
        checkpoint: createFederatedSessionCheckpoint(envelope),
        previewBounds: null,
    };
}

test('validateFederationIngress canonicalizes begin payload and enforces coordination-only authority', () => {
    const event = {
        type: EventTypes.COLLABORATION_FEDERATION_SESSION_BEGIN,
        payload: {
            sessionId: '  sess-1  ',
            sessionType: 'create',
            authority: { ownerId: ' owner ', mode: 'coordination-only' },
        },
    };
    const validated = validateFederationIngress(event, null);
    assert.equal(validated.payload.sessionId, 'sess-1');
    assert.equal(validated.payload.authority.mode, 'coordination-only');

    assert.throws(
        () =>
            validateFederationIngress(
                {
                    ...event,
                    payload: { ...event.payload, authority: { ownerId: 'x', mode: 'mutation-authority' } },
                },
                null,
            ),
        /"reason":"INVALID_AUTHORITY_MODE"/,
    );
});

test('validateFederationIngress rejects malformed and foreign events fail-closed', () => {
    assert.throws(
        () => validateFederationIngress({ type: EventTypes.COLLABORATION_FEDERATION_SESSION_PREVIEW, payload: {} }, null),
        /"reason":"INVALID_SESSION_ID"/,
    );
    assert.throws(
        () =>
            validateFederationIngress(
                {
                    type: EventTypes.COLLABORATION_FEDERATION_SESSION_COMMIT,
                    payload: {
                        sessionId: 'sess-foreign',
                        expectedCheckpointSignature: 'sig',
                    },
                },
                null,
            ),
        /"reason":"SESSION_NOT_FOUND"/,
    );
});

test('validateFederationIngress enforces allowed phase transitions and signature requirement', () => {
    const committedRecord = createRecord('committed');

    assert.throws(
        () =>
            validateFederationIngress(
                {
                    type: EventTypes.COLLABORATION_FEDERATION_SESSION_PREVIEW,
                    payload: { sessionId: 'sess-validate', expectedCheckpointSignature: 'sig' },
                },
                committedRecord,
            ),
        /"reason":"INVALID_PHASE_TRANSITION"/,
    );

    assert.throws(
        () =>
            validateFederationIngress(
                {
                    type: EventTypes.COLLABORATION_FEDERATION_SESSION_COMMIT,
                    payload: { sessionId: 'sess-validate' },
                },
                createRecord('preview'),
            ),
        /"reason":"MISSING_CHECKPOINT_SIGNATURE"/,
    );
});

