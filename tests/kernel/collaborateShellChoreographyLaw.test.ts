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
            assistantSummary: 'Collaborate Assistant stays quiet until people need help aligning.',
            focusState: 'review',
            focusSummary: 'Collaborate is emphasizing review, feedback, and aligned decisions.',
        }),
    );
});

test('collaborate shell choreography centers collaboration-native behavior and yields to assistant facilitation', () => {
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

    assert.equal(leading.dominantContext, 'review');
    assert.equal(leading.roomState, 'review-focused');
    assert.equal(leading.workflowState, 'leading');
    assert.equal(leading.handoffState, 'ready');
    assert.equal(leading.assistantState, 'ready');
    assert.equal(leading.focusState, 'review');

    assert.equal(engaged.dominantContext, 'assistant');
    assert.equal(engaged.roomState, 'assistant-facilitating');
    assert.equal(engaged.workflowState, 'yielding');
    assert.equal(engaged.handoffState, 'ready');
    assert.equal(engaged.assistantState, 'engaged');
    assert.equal(engaged.focusState, 'discussion');
});

test('collaborate shell choreography exposes collaboration-native room states by entry', () => {
    const production = resolveCollaborateShellChoreography({
        activeEntryId: 'production',
        hasWorkflow: true,
    });
    const knowledge = resolveCollaborateShellChoreography({
        activeEntryId: 'knowledge',
        hasWorkflow: true,
    });
    const education = resolveCollaborateShellChoreography({
        activeEntryId: 'education',
        hasWorkflow: true,
    });

    assert.equal(production.focusState, 'alignment');
    assert.equal(production.roomState, 'discussion-active');
    assert.match(production.focusSummary, /alignment/i);

    assert.equal(knowledge.focusState, 'discussion');
    assert.equal(knowledge.roomState, 'discussion-active');
    assert.match(knowledge.focusSummary, /discussion/i);

    assert.equal(education.focusState, 'learning');
    assert.equal(education.roomState, 'education-guiding');
    assert.match(education.focusSummary, /guided learning/i);
});
