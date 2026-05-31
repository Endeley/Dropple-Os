import test from 'node:test';
import assert from 'node:assert/strict';

import { getAssistantCapabilityById } from '@/runtime/assistants/registry.js';
import { evaluateAssistantActionPolicy } from '@/runtime/assistants/evaluateAssistantActionPolicy.js';

test('assistant policy evaluation is deterministic and perspective-scoped', () => {
    const capability = getAssistantCapabilityById('assistant.build');
    assert.ok(capability);

    const left = evaluateAssistantActionPolicy({
        assistantCapability: capability,
        action: 'recommend',
        requestedPerspectiveId: 'build',
    });
    const right = evaluateAssistantActionPolicy({
        assistantCapability: capability,
        action: 'recommend',
        requestedPerspectiveId: 'build',
    });

    assert.deepEqual(left, right);
    assert.equal(left.allowed, true);
    assert.equal(left.perspectiveId, 'build');
});

test('assistant policy evaluation fails closed on unsupported action', () => {
    const capability = getAssistantCapabilityById('assistant.design');
    assert.ok(capability);

    assert.throws(
        () =>
            evaluateAssistantActionPolicy({
                assistantCapability: capability,
                action: 'execute-approved-workflow',
                requestedPerspectiveId: 'create',
            }),
        /assistant action is not allowed/,
    );
});

test('assistant policy evaluation fails closed on perspective mismatch', () => {
    const capability = getAssistantCapabilityById('assistant.publish');
    assert.ok(capability);

    assert.throws(
        () =>
            evaluateAssistantActionPolicy({
                assistantCapability: capability,
                action: 'recommend',
                requestedPerspectiveId: 'build',
            }),
        /assistant perspective mismatch/,
    );
});
