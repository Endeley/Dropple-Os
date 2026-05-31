import test from 'node:test';
import assert from 'node:assert/strict';

import {
    ASSISTANT_ACTIONS,
    ASSISTANT_FORBIDDEN_AUTHORITIES,
    normalizeAssistantCapabilityV1,
} from '@/core/contracts/assistantCapability.v1.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('assistant capability contract normalizes deterministically and fail-closed', () => {
    const normalized = normalizeAssistantCapabilityV1({
        id: 'assistant.build',
        label: 'Build Assistant',
        perspectiveId: 'build',
        actions: ['generate', 'recommend', 'generate'],
        allowedEventTypes: [EventTypes.AI_REQUEST_ENQUEUE],
        forbiddenAuthorities: ['document-truth-authority', 'dispatcher-mutation-authority'],
    });

    assert.equal(normalized.schemaVersion, 1);
    assert.deepEqual(normalized.actions, ['generate', 'recommend']);
    assert.deepEqual(normalized.allowedEventTypes, [EventTypes.AI_REQUEST_ENQUEUE]);
    assert.deepEqual(normalized.forbiddenAuthorities, ['dispatcher-mutation-authority', 'document-truth-authority']);
});

test('assistant capability contract exports immutable constitutional lists', () => {
    assert.equal(Object.isFrozen(ASSISTANT_ACTIONS), true);
    assert.equal(Object.isFrozen(ASSISTANT_FORBIDDEN_AUTHORITIES), true);
    assert.ok(ASSISTANT_ACTIONS.includes('recommend'));
    assert.ok(ASSISTANT_FORBIDDEN_AUTHORITIES.includes('dispatcher-mutation-authority'));
});

test('assistant capability contract rejects unsupported actions or event authority', () => {
    assert.throws(
        () =>
            normalizeAssistantCapabilityV1({
                id: 'assistant.bad',
                label: 'Bad Assistant',
                perspectiveId: 'build',
                actions: ['mutate-truth-directly'],
                allowedEventTypes: [EventTypes.NODE_CREATE],
                forbiddenAuthorities: ['runtime-truth-authority'],
            }),
        /unsupported value/,
    );
});
