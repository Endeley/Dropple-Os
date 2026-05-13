import test from 'node:test';
import assert from 'node:assert/strict';

import {
    isSynthesizedToolSource,
    validateNoRecursiveToolRegistration,
} from '@/runtime/tools/toolRegistrationRecursionGuard.js';

test('isSynthesizedToolSource recognizes synthesized registration domains', () => {
    assert.equal(isSynthesizedToolSource('capability.graph'), true);
    assert.equal(isSynthesizedToolSource('synth.media'), true);
    assert.equal(isSynthesizedToolSource('interpreted.uiux'), true);
    assert.equal(isSynthesizedToolSource('workspace:graphic'), false);
});

test('validateNoRecursiveToolRegistration allows first-order synthesized registration', () => {
    assert.deepEqual(
        validateNoRecursiveToolRegistration({
            source: 'capability.graph',
            tools: ['move'],
            descriptors: [{ id: 'move', label: 'Move', handlerFamily: 'session' }],
        }),
        { ok: true },
    );
});

test('validateNoRecursiveToolRegistration rejects nested registration intents/actions from synthesized sources', () => {
    const result = validateNoRecursiveToolRegistration({
        source: 'capability.graph',
        tools: ['move'],
        descriptors: [{
            id: 'move',
            label: 'Move',
            handlerFamily: 'session',
            metadata: {
                nested: {
                    type: 'capability.tools.register.requested',
                    payload: { source: 'capability.inner', tools: ['shape'] },
                },
            },
        }],
    });

    assert.equal(result.ok, false);
    assert.equal(result.code, 'tool-registration-recursive-sovereignty-blocked');
});

