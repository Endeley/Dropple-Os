import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveCreateAssistantActionLabels } from '@/runtime/workspaces/createAssistantActionLabels.js';

test('create assistant action labels are deterministic and entry-aware for design and media surfaces', () => {
    const designA = resolveCreateAssistantActionLabels('uiux');
    const designB = resolveCreateAssistantActionLabels('uiux');
    const media = resolveCreateAssistantActionLabels('animation');

    assert.deepEqual(designA, designB);
    assert.equal(designA.assistantLabel, 'Design Assistant');
    assert.equal(designA.generateLabel, 'Generate UI Options');
    assert.equal(media.assistantLabel, 'Media Assistant');
    assert.equal(media.generateLabel, 'Generate Motion Options');
});

test('create assistant action labels fail closed for unknown entries', () => {
    assert.deepEqual(
        resolveCreateAssistantActionLabels('unknown'),
        Object.freeze({
            assistantLabel: 'Assistant',
            recommendLabel: 'Ask Assistant',
            generateLabel: 'Generate Options',
            explainLabel: 'Improve This',
        }),
    );
});
