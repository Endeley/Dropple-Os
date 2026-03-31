import test from 'node:test';
import assert from 'node:assert/strict';

import { createSessionFromIntent } from '@/runtime/input/sessionRuntimeBridge.js';
import { createSessionCommitActions } from '@/runtime/input/sessionCommitRuntimeBridge.js';
import { __resetRuntimeStateInternal, __setRuntimeStateInternal, initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { VIEWPORT_PAN, VIEWPORT_ZOOM } from '@/core/events/viewportEvents.js';
import { createCanonicalDocumentEnvelope } from '@/core/persistence/documentEnvelope.js';

function seedRuntime(overrides = {}) {
    __resetRuntimeStateInternal();
    __setRuntimeStateInternal(
        {
            ...initialRuntimeState,
            ...overrides,
            workspace: {
                ...initialRuntimeState.workspace,
                ...(overrides.workspace ?? {}),
            },
            scene: {
                ...initialRuntimeState.scene,
                ...(overrides.scene ?? {}),
            },
        },
        'system',
    );
}

test('session runtime bridge creates pan session and commit bridge emits viewport pan', () => {
    seedRuntime();

    const session = createSessionFromIntent({
        sessionType: 'pan',
        payload: {
            startPointer: { x: 10, y: 15 },
        },
        nodesById: {},
    });

    session.onPointerMove({ x: 25, y: 35 });
    const actions = createSessionCommitActions({
        event: {
            sessionType: 'pan',
            payload: session.commit(),
        },
        context: {},
    });

    assert.equal(actions.dispatchEvents[0].type, VIEWPORT_PAN);
    assert.deepEqual(actions.dispatchEvents[0].payload, { dx: 15, dy: 20 });
});

test('session runtime bridge creates zoom session and commit bridge emits viewport zoom', () => {
    seedRuntime({
        workspace: {
            viewport: { x: 0, y: 0, scale: 1 },
        },
    });

    const session = createSessionFromIntent({
        sessionType: 'zoom',
        payload: {
            startPointer: { x: 10, y: 20 },
        },
        nodesById: {},
    });

    session.onPointerMove({ x: 10, y: 0 });
    const actions = createSessionCommitActions({
        event: {
            sessionType: 'zoom',
            payload: session.commit(),
        },
        context: {},
    });

    assert.equal(actions.dispatchEvents[0].type, VIEWPORT_ZOOM);
    assert.equal(typeof actions.dispatchEvents[0].payload.scale, 'number');
});

test('session runtime bridge returns null for unsupported legacy session types', () => {
    seedRuntime({
        document: createCanonicalDocumentEnvelope(),
    });

    const session = createSessionFromIntent({
        sessionType: 'unsupported',
        payload: {
            startPointer: { x: 0, y: 0 },
        },
        nodesById: {},
    });

    assert.equal(session, null);
});
