import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { handleCapabilityIntent } from '@/runtime/capabilities/toolRegistrationRuntime.js';

test('register intent dispatches registerTools action', () => {
    const dispatched = [];
    const emitted = [];
    const dispatcher = {
        dispatch(action) {
            dispatched.push(action);
        },
    };

    handleCapabilityIntent(
        {
            type: 'capability.tools.register.requested',
            payload: {
                source: 'graph',
                tools: ['select', 'shape'],
                currentTimeMs: 7,
            },
        },
        { dispatcher, onGovernanceAccept: (entry) => emitted.push(entry) },
    );

    assert.equal(dispatched.length, 1);
    assert.deepEqual(dispatched[0], {
        type: EventTypes.TOOLS_REGISTER,
        payload: {
            source: 'graph',
            tools: ['select', 'shape'],
            descriptors: [],
            priority: 0,
        },
    });
    assert.equal(emitted.length, 1);
    assert.equal(emitted[0]?.type, 'runtime.tools.governance.accept');
    assert.deepEqual(emitted[0]?.payload, {
        code: 'tool-registration-approved',
        source: 'graph',
        toolIds: ['select', 'shape'],
        atEventType: 'capability.tools.register.requested',
        reason: 'capability-boundary-governance-approved',
    });
    assert.equal(emitted[0]?.timestamp, 7);
});

test('unregister intent dispatches unregisterTools action', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(action) {
            dispatched.push(action);
        },
    };

    handleCapabilityIntent(
        {
            type: 'capability.tools.unregister.requested',
            payload: {
                source: 'graph',
            },
        },
        { dispatcher },
    );

    assert.equal(dispatched.length, 1);
    assert.deepEqual(dispatched[0], {
        type: EventTypes.TOOLS_UNREGISTER,
        payload: {
            source: 'graph',
        },
    });
});

test('ignores malformed capability tool intents', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(action) {
            dispatched.push(action);
        },
    };

    handleCapabilityIntent(
        {
            type: 'capability.tools.register.requested',
            payload: {
                tools: ['select'],
            },
        },
        { dispatcher },
    );

    handleCapabilityIntent(
        {
            type: 'capability.tools.unregister.requested',
            payload: {},
        },
        { dispatcher },
    );

    handleCapabilityIntent(
        {
            type: 'capability.tools.unknown',
            payload: {
                source: 'graph',
            },
        },
        { dispatcher },
    );

    assert.deepEqual(dispatched, []);
});

test('source-scoped unregister remains deterministic and idempotent at the runtime boundary', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(action) {
            dispatched.push(action);
        },
    };

    const event = {
        type: 'capability.tools.unregister.requested',
        payload: {
            source: 'synth.graph',
        },
    };

    handleCapabilityIntent(event, { dispatcher });
    handleCapabilityIntent(event, { dispatcher });

    assert.deepEqual(dispatched, [
        {
            type: EventTypes.TOOLS_UNREGISTER,
            payload: {
                source: 'synth.graph',
            },
        },
        {
            type: EventTypes.TOOLS_UNREGISTER,
            payload: {
                source: 'synth.graph',
            },
        },
    ]);
});

test('capability register intent rejects recursive tool registration payloads', () => {
    const dispatched = [];
    const emitted = [];
    const dispatcher = {
        dispatch(action) {
            dispatched.push(action);
        },
    };

    handleCapabilityIntent(
        {
            type: 'capability.tools.register.requested',
            payload: {
                source: 'capability.graph',
                tools: ['move'],
                currentTimeMs: 42,
                descriptors: [{
                    id: 'move',
                    label: 'Move',
                    handlerFamily: 'session',
                    metadata: {
                        nested: {
                            type: EventTypes.TOOLS_REGISTER,
                            payload: { source: 'capability.inner', tools: ['shape'] },
                        },
                    },
                }],
            },
        },
        { dispatcher, onGovernanceReject: (entry) => emitted.push(entry) },
    );

    assert.deepEqual(dispatched, []);
    assert.equal(emitted.length, 1);
    assert.equal(emitted[0]?.type, 'runtime.tools.governance.reject');
    assert.deepEqual(emitted[0]?.payload, {
        code: 'tool-registration-recursive-sovereignty-blocked',
        source: 'capability.graph',
        toolIds: ['move'],
        atEventType: 'capability.tools.register.requested',
        reason: 'tool-registration-recursive-sovereignty-blocked',
    });
    assert.equal(emitted[0]?.timestamp, 42);
});
