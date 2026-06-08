import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveBuildShellChoreography } from '@/runtime/workspaces/buildShellChoreography.js';

test('build shell choreography is deterministic and receded by default', () => {
    const left = resolveBuildShellChoreography();
    const right = resolveBuildShellChoreography();

    assert.deepEqual(left, right);
    assert.deepEqual(
        left,
        Object.freeze({
            dominantContext: 'project',
            roomState: 'receded',
            workflowState: 'dormant',
            handoffState: 'idle',
            assistantState: 'idle',
            assistantSummary: 'Build Assistant stays quiet until build context deepens.',
            focusState: 'structure',
            focusSummary: 'Build is emphasizing application structure and connected system shape.',
        }),
    );
});

test('build shell choreography leads with workflow and yields to assistant engagement', () => {
    const leading = resolveBuildShellChoreography({
        activeEntryId: 'application',
        hasWorkflow: true,
        hasOperateHandoff: true,
        assistantState: 'ready',
    });
    const engaged = resolveBuildShellChoreography({
        activeEntryId: 'logic',
        hasWorkflow: true,
        hasOperateHandoff: true,
        assistantState: 'engaged',
    });

    assert.equal(leading.dominantContext, 'workflow');
    assert.equal(leading.roomState, 'workflow-leading');
    assert.equal(leading.workflowState, 'leading');
    assert.equal(leading.handoffState, 'ready');
    assert.equal(leading.assistantState, 'ready');
    assert.equal(leading.focusState, 'structure');

    assert.equal(engaged.dominantContext, 'assistant');
    assert.equal(engaged.roomState, 'assistant-engaged');
    assert.equal(engaged.workflowState, 'yielding');
    assert.equal(engaged.handoffState, 'ready');
    assert.equal(engaged.assistantState, 'engaged');
    assert.equal(engaged.focusState, 'dependency');
});

test('build shell choreography exposes entry-specific focus semantics', () => {
    const automation = resolveBuildShellChoreography({
        activeEntryId: 'automation',
        hasWorkflow: true,
    });
    const conversion = resolveBuildShellChoreography({
        activeEntryId: 'conversion',
        hasWorkflow: true,
    });

    assert.equal(automation.focusState, 'execution');
    assert.match(automation.focusSummary, /execution flow/i);

    assert.equal(conversion.focusState, 'delivery');
    assert.match(conversion.focusSummary, /delivery flow/i);
});
