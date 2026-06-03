import test from 'node:test';
import assert from 'node:assert/strict';

import { resolvePublishAssistantActionLabels } from '@/runtime/workspaces/publishAssistantActionLabels.js';

test('publish assistant action labels are deterministic and entry-aware for release surfaces', () => {
    const governanceA = resolvePublishAssistantActionLabels('governance');
    const governanceB = resolvePublishAssistantActionLabels('governance');
    const versioning = resolvePublishAssistantActionLabels('versioning');
    const themes = resolvePublishAssistantActionLabels('themes');

    assert.deepEqual(governanceA, governanceB);
    assert.equal(governanceA.assistantLabel, 'Publishing Assistant');
    assert.equal(governanceA.generateLabel, 'Generate Governance Options');
    assert.equal(versioning.explainLabel, 'Improve This Version Plan');
    assert.equal(themes.generateLabel, 'Generate Theme Options');
});

test('publish assistant action labels fail closed for unknown entries', () => {
    assert.deepEqual(
        resolvePublishAssistantActionLabels('unknown'),
        Object.freeze({
            assistantLabel: 'Assistant',
            recommendLabel: 'Ask Assistant',
            generateLabel: 'Generate Options',
            explainLabel: 'Improve This',
        }),
    );
});
