import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAssistantSurfaceModel } from '@/runtime/osSurface/buildAssistantSurfaceModel.js';

test('assistant surface model is deterministic and mutation-free', () => {
    const input = {
        perspectiveId: 'create',
        activeAssistantId: 'assistant.design',
        assistantIds: ['assistant.media', 'assistant.design', 'assistant.media'],
    };
    const before = JSON.parse(JSON.stringify(input));

    const left = buildAssistantSurfaceModel(input);
    const right = buildAssistantSurfaceModel(input);

    assert.deepEqual(input, before);
    assert.deepEqual(left, right);
    assert.deepEqual(left.assistantIds, ['assistant.design', 'assistant.media']);
});
