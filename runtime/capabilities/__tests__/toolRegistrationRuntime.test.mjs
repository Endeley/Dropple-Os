import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { handleCapabilityIntent } from '@/runtime/capabilities/toolRegistrationRuntime.js';

test('register intent dispatches registerTools action', () => {
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
                source: 'graph',
                tools: ['select', 'shape'],
            },
        },
        { dispatcher },
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
