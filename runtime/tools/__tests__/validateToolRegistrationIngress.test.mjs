import test from 'node:test';
import assert from 'node:assert/strict';

import { validateToolRegistrationIngress } from '@/runtime/tools/validateToolRegistrationIngress.js';

test('validateToolRegistrationIngress accepts non-synthesized sources without descriptor constraints', () => {
    const result = validateToolRegistrationIngress({
        source: 'workspace:design',
        descriptors: [{
            id: 'select',
            handlerFamily: 'dispatcher',
            dispatch: () => {},
        }],
    });

    assert.deepEqual(result, { ok: true });
});

test('validateToolRegistrationIngress rejects synthesized descriptors with unsupported handler family', () => {
    const result = validateToolRegistrationIngress({
        source: 'capability.graph',
        descriptors: [{
            id: 'select',
            label: 'Select',
            handlerFamily: 'dispatcher',
        }],
    });

    assert.equal(result.ok, false);
    assert.equal(result.code, 'tool-registration-handler-family-invalid');
});

test('validateToolRegistrationIngress rejects synthesized descriptors with authority-bearing keys', () => {
    const result = validateToolRegistrationIngress({
        source: 'synth.graph',
        descriptors: [{
            id: 'move',
            label: 'Move',
            handlerFamily: 'session',
            handlerPayload: { sessionType: 'move' },
            executionSignature: {
                schemaVersion: '1.0',
                executionMode: 'session',
                intentKind: 'session',
                nodeType: '',
                sessionType: 'move',
            },
            dispatch: 'intent.node.move',
        }],
    });

    assert.equal(result.ok, false);
    assert.equal(result.code, 'tool-registration-descriptor-authority-leak');
});

test('validateToolRegistrationIngress accepts synthesized descriptors inside approved constitutional boundary', () => {
    const result = validateToolRegistrationIngress({
        source: 'capability.graph',
        descriptors: [{
            id: 'move',
            label: 'Move',
            group: 'edit',
            defaultActive: false,
            intentTopics: ['layout/move'],
            capabilityTags: ['graph.transform'],
            metadata: { createsNode: false },
            handlerFamily: 'session',
            handlerPayload: { sessionType: 'move' },
            executionSignature: {
                schemaVersion: '1.0',
                executionMode: 'session',
                intentKind: 'session',
                nodeType: '',
                sessionType: 'move',
            },
        }],
    });

    assert.deepEqual(result, { ok: true });
});

