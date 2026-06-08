import test from 'node:test';
import assert from 'node:assert/strict';

import { resolvePublishShellChoreography } from '@/runtime/workspaces/publishShellChoreography.js';

test('publish shell choreography is deterministic and receded by default', () => {
    const left = resolvePublishShellChoreography();
    const right = resolvePublishShellChoreography();

    assert.deepEqual(left, right);
    assert.deepEqual(
        left,
        Object.freeze({
            dominantContext: 'project',
            roomState: 'receded',
            workflowState: 'dormant',
            anchorState: 'floating',
            assistantState: 'idle',
            assistantSummary: 'Publishing Assistant stays quiet until publish context deepens.',
            focusState: 'governance',
            focusSummary: 'Publish is emphasizing governance, policy, and release authority.',
        }),
    );
});

test('publish shell choreography leads with workflow and yields to assistant engagement', () => {
    const leading = resolvePublishShellChoreography({
        activeEntryId: 'governance',
        hasWorkflow: true,
        hasUniverseAnchor: true,
        assistantState: 'ready',
    });
    const engaged = resolvePublishShellChoreography({
        activeEntryId: 'conversion',
        hasWorkflow: true,
        hasUniverseAnchor: true,
        assistantState: 'engaged',
    });

    assert.equal(leading.dominantContext, 'workflow');
    assert.equal(leading.roomState, 'workflow-leading');
    assert.equal(leading.workflowState, 'leading');
    assert.equal(leading.anchorState, 'anchored');
    assert.equal(leading.assistantState, 'ready');
    assert.equal(leading.focusState, 'governance');

    assert.equal(engaged.dominantContext, 'assistant');
    assert.equal(engaged.roomState, 'guidance-engaged');
    assert.equal(engaged.workflowState, 'yielding');
    assert.equal(engaged.anchorState, 'supporting');
    assert.equal(engaged.assistantState, 'engaged');
    assert.equal(engaged.focusState, 'delivery');
});

test('publish shell choreography exposes entry-specific focus semantics', () => {
    const versioning = resolvePublishShellChoreography({
        activeEntryId: 'versioning',
        hasWorkflow: true,
    });
    const tokens = resolvePublishShellChoreography({
        activeEntryId: 'tokens',
        hasWorkflow: true,
    });

    assert.equal(versioning.focusState, 'release');
    assert.match(versioning.focusSummary, /release coordination/i);

    assert.equal(tokens.focusState, 'system');
    assert.match(tokens.focusSummary, /system publication/i);
});
