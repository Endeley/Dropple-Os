import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveCreateShellChoreography } from '@/runtime/workspaces/createShellChoreography.js';

test('create shell choreography is deterministic and project-guiding by default', () => {
    const left = resolveCreateShellChoreography();
    const right = resolveCreateShellChoreography();

    assert.deepEqual(left, right);
    assert.deepEqual(
        left,
        Object.freeze({
            dominantContext: 'project',
            utilityState: 'guiding',
            utilitySummary: 'Project context is leading this Create session.',
            assistantState: 'idle',
            assistantSummary: 'Assistant stays quiet until help is requested.',
            timelineState: 'dormant',
            timelineSummary: 'Motion context is dormant and the timeline should stay compact.',
        }),
    );
});

test('create shell choreography recedes utility surfaces for selection and motion contexts', () => {
    const selection = resolveCreateShellChoreography({
        hasSelection: true,
        assistantState: 'ready',
    });
    const motion = resolveCreateShellChoreography({
        hasSelection: true,
        hasMotionContext: true,
        assistantState: 'engaged',
    });

    assert.equal(selection.dominantContext, 'selection');
    assert.equal(selection.utilityState, 'receded');
    assert.equal(selection.assistantState, 'ready');
    assert.equal(selection.timelineState, 'dormant');

    assert.equal(motion.dominantContext, 'motion');
    assert.equal(motion.utilityState, 'receded');
    assert.equal(motion.assistantState, 'engaged');
    assert.equal(motion.timelineState, 'raised');
});

test('create shell choreography keeps navigate and blueprint panels explicit when selected', () => {
    const navigate = resolveCreateShellChoreography({
        utilityPanel: 'navigate',
        hasSelection: true,
    });
    const blueprints = resolveCreateShellChoreography({
        utilityPanel: 'blueprints',
        assistantState: 'engaged',
    });

    assert.equal(navigate.dominantContext, 'selection');
    assert.equal(navigate.utilityState, 'navigation');
    assert.match(navigate.utilitySummary, /Navigate the world/);

    assert.equal(blueprints.dominantContext, 'assistant');
    assert.equal(blueprints.utilityState, 'blueprints');
    assert.match(blueprints.utilitySummary, /Blueprint actions/);
});
