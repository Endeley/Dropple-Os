import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createInterpretedToolRegistration,
    createInterpretedToolUnregistration,
} from '@/runtime/tools/createInterpretedToolRegistration.js';
import { handleCapabilityIntent } from '@/runtime/capabilities/toolRegistrationRuntime.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('interpreted tool registration creates a deterministic capability-bounded request', () => {
    const capabilitySet = new Set(['node.create']);
    const a = createInterpretedToolRegistration({
        source: 'synth.graph',
        capabilitySet,
        spec: {
            id: 'shape',
            label: 'Shape',
            createsNode: true,
            nodeType: 'shape',
        },
    });
    const b = createInterpretedToolRegistration({
        capabilitySet: ['node.create'],
        spec: {
            nodeType: 'shape',
            createsNode: true,
            label: 'Shape',
            id: 'shape',
        },
        source: 'synth.graph',
    });

    assert.deepEqual(a, b);
    assert.equal(a.registrationId, 'synth.graph:shape:createNode');
    assert.equal(a.event.type, 'capability.tools.register.requested');
    assert.deepEqual(a.event.payload, {
        source: 'synth.graph',
        tools: ['shape'],
    });
});

test('interpreted tool registration rejects visibility when capability policy is missing required caps', () => {
    const registration = createInterpretedToolRegistration({
        source: 'synth.graph',
        capabilitySet: new Set(['node.select']),
        spec: {
            id: 'shape',
            label: 'Shape',
            createsNode: true,
            nodeType: 'shape',
        },
    });

    assert.equal(registration, null);
});

test('interpreted tool registration stays authority-free and routes through canonical registration runtime', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(action) {
            dispatched.push(action);
        },
    };
    const registration = createInterpretedToolRegistration({
        source: 'synth.viewport',
        capabilitySet: new Set(['viewport.pan']),
        spec: {
            id: 'pan',
            label: 'Pan',
        },
    });

    assert.equal(Object.prototype.hasOwnProperty.call(registration, 'dispatch'), false);
    handleCapabilityIntent(registration.event, { dispatcher });

    assert.deepEqual(dispatched, [
        {
            type: EventTypes.TOOLS_REGISTER,
            payload: {
                source: 'synth.viewport',
                tools: ['pan'],
                descriptors: [],
                priority: 0,
            },
        },
    ]);
});

test('same interpreted spec produces the same canonical registration identity', () => {
    const registration = createInterpretedToolRegistration({
        source: 'synth.select',
        spec: {
            id: 'select',
            label: 'Select',
        },
    });

    assert.equal(registration.registrationId, 'synth.select:select:utility');
});

test('interpreted tool unregistration creates a deterministic source-scoped request', () => {
    const a = createInterpretedToolUnregistration({
        source: 'synth.graph',
    });
    const b = createInterpretedToolUnregistration({
        source: ' synth.graph ',
    });

    assert.deepEqual(a, b);
    assert.equal(a.registrationId, 'synth.graph:unregister');
    assert.deepEqual(a.event, {
        type: 'capability.tools.unregister.requested',
        payload: {
            source: 'synth.graph',
        },
    });
});

test('interpreted tool unregistration stays authority-free and routes through canonical runtime', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(action) {
            dispatched.push(action);
        },
    };

    const unregistration = createInterpretedToolUnregistration({
        source: 'synth.graph',
    });

    assert.equal(Object.prototype.hasOwnProperty.call(unregistration, 'dispatch'), false);
    handleCapabilityIntent(unregistration.event, { dispatcher });

    assert.deepEqual(dispatched, [
        {
            type: EventTypes.TOOLS_UNREGISTER,
            payload: {
                source: 'synth.graph',
            },
        },
    ]);
});
