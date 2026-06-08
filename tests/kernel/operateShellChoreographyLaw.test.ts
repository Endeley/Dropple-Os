import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveOperateShellChoreography } from '@/runtime/workspaces/operateShellChoreography.js';

test('operate shell choreography is deterministic and receded by default', () => {
    const left = resolveOperateShellChoreography();
    const right = resolveOperateShellChoreography();

    assert.deepEqual(left, right);
    assert.deepEqual(
        left,
        Object.freeze({
            dominantContext: 'project',
            roomState: 'receded',
            workflowState: 'dormant',
            anchorState: 'floating',
            assistantState: 'idle',
            assistantSummary: 'Operations Assistant stays quiet until operating context deepens.',
            focusState: 'automation',
            focusSummary: 'Operate is emphasizing automation flow and downstream system response.',
        }),
    );
});

test('operate shell choreography leads with workflow and yields to assistant engagement', () => {
    const leading = resolveOperateShellChoreography({
        activeEntryId: 'systems-engineering',
        hasWorkflow: true,
        hasUniverseAnchor: true,
        assistantState: 'ready',
    });
    const engaged = resolveOperateShellChoreography({
        activeEntryId: 'enterprise-operations',
        hasWorkflow: true,
        hasUniverseAnchor: true,
        assistantState: 'engaged',
    });

    assert.equal(leading.dominantContext, 'workflow');
    assert.equal(leading.roomState, 'workflow-leading');
    assert.equal(leading.workflowState, 'leading');
    assert.equal(leading.anchorState, 'anchored');
    assert.equal(leading.assistantState, 'ready');
    assert.equal(leading.focusState, 'systems');

    assert.equal(engaged.dominantContext, 'assistant');
    assert.equal(engaged.roomState, 'guidance-engaged');
    assert.equal(engaged.workflowState, 'yielding');
    assert.equal(engaged.anchorState, 'supporting');
    assert.equal(engaged.assistantState, 'engaged');
    assert.equal(engaged.focusState, 'operations');
});

test('operate shell choreography exposes entry-specific focus semantics', () => {
    const governance = resolveOperateShellChoreography({
        activeEntryId: 'governance',
        hasUniverseAnchor: true,
    });
    const production = resolveOperateShellChoreography({
        activeEntryId: 'production',
        hasWorkflow: true,
    });

    assert.equal(governance.focusState, 'governance');
    assert.match(governance.focusSummary, /oversight/i);

    assert.equal(production.focusState, 'execution');
    assert.match(production.focusSummary, /execution/i);
});
