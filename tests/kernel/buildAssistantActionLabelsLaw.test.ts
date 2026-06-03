import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveBuildAssistantActionLabels } from '@/runtime/workspaces/buildAssistantActionLabels.js';

test('build assistant action labels are deterministic and entry-aware for core build surfaces', () => {
    const applicationA = resolveBuildAssistantActionLabels('application');
    const applicationB = resolveBuildAssistantActionLabels('application');
    const automation = resolveBuildAssistantActionLabels('automation');
    const ai = resolveBuildAssistantActionLabels('ai');

    assert.deepEqual(applicationA, applicationB);
    assert.equal(applicationA.assistantLabel, 'Build Assistant');
    assert.equal(applicationA.generateLabel, 'Generate App Options');
    assert.equal(automation.generateLabel, 'Generate Workflow Options');
    assert.equal(ai.explainLabel, 'Improve This Agent');
});

test('build assistant action labels fail closed for unknown entries', () => {
    assert.deepEqual(
        resolveBuildAssistantActionLabels('unknown'),
        Object.freeze({
            assistantLabel: 'Assistant',
            recommendLabel: 'Ask Assistant',
            generateLabel: 'Generate Options',
            explainLabel: 'Improve This',
        }),
    );
});
