import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveCollaborateShellChoreography } from '@/runtime/workspaces/collaborateShellChoreography.js';

test('collaborate shell choreography is deterministic and receded by default', () => {
    const left = resolveCollaborateShellChoreography();
    const right = resolveCollaborateShellChoreography();

    assert.deepEqual(left, right);
    assert.deepEqual(
        left,
        Object.freeze({
            dominantContext: 'project',
            roomState: 'receded',
            workflowState: 'dormant',
            handoffState: 'idle',
            assistantState: 'idle',
            assistantSummary: 'Collaborate Assistant stays quiet until collaboration context deepens.',
            focusState: 'review',
            focusSummary: 'Collaborate is emphasizing review flow and coordinated decision-making.',
        }),
    );
});

test('collaborate shell choreography leads with workflow and yields to assistant engagement', () => {
    const leading = resolveCollaborateShellChoreography({
        activeEntryId: 'review',
        hasWorkflow: true,
        hasPublishHandoff: true,
        assistantState: 'ready',
    });
    const engaged = resolveCollaborateShellChoreography({
        activeEntryId: 'knowledge',
        hasWorkflow: true,
        hasPublishHandoff: true,
        assistantState: 'engaged',
    });

    assert.equal(leading.dominantContext, 'workflow');
    assert.equal(leading.roomState, 'workflow-leading');
    assert.equal(leading.workflowState, 'leading');
    assert.equal(leading.handoffState, 'ready');
    assert.equal(leading.assistantState, 'ready');
    assert.equal(leading.focusState, 'review');

    assert.equal(engaged.dominantContext, 'assistant');
    assert.equal(engaged.roomState, 'assistant-engaged');
    assert.equal(engaged.workflowState, 'yielding');
    assert.equal(engaged.handoffState, 'ready');
    assert.equal(engaged.assistantState, 'engaged');
    assert.equal(engaged.focusState, 'knowledge');
});

test('collaborate shell choreography exposes entry-specific focus semantics', () => {
    const production = resolveCollaborateShellChoreography({
        activeEntryId: 'production',
        hasWorkflow: true,
    });
    const education = resolveCollaborateShellChoreography({
        activeEntryId: 'education',
        hasWorkflow: true,
    });

    assert.equal(production.focusState, 'production');
    assert.match(production.focusSummary, /production flow/i);

    assert.equal(education.focusState, 'learning');
    assert.match(education.focusSummary, /learning flow/i);
});
