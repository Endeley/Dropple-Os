import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getAssistantCapabilityById,
    listAssistantCapabilities,
    listAssistantCapabilitiesForPerspective,
} from '@/runtime/assistants/registry.js';

test('assistant registry is deterministic and non-empty', () => {
    const all = listAssistantCapabilities();
    assert.equal(Array.isArray(all), true);
    assert.ok(all.length >= 5);
    assert.deepEqual(
        all.map((entry) => entry.id),
        [...all.map((entry) => entry.id)].sort(),
    );
});

test('assistant registry resolves by perspective and assistant id', () => {
    const createAssistants = listAssistantCapabilitiesForPerspective('create');
    assert.ok(createAssistants.some((entry) => entry.id === 'assistant.design'));
    assert.ok(createAssistants.some((entry) => entry.id === 'assistant.media'));

    const buildAssistant = getAssistantCapabilityById('assistant.build');
    assert.equal(buildAssistant?.perspectiveId, 'build');
});

test('assistant registry fails closed for unknown selectors', () => {
    assert.equal(getAssistantCapabilityById('assistant.unknown'), null);
    assert.deepEqual(listAssistantCapabilitiesForPerspective('unknown'), []);
});
