import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveOperateAssistantActionLabels } from '@/runtime/workspaces/operateAssistantActionLabels.js';

test('operate assistant action labels are deterministic and entry-aware for operations surfaces', () => {
    const systemsA = resolveOperateAssistantActionLabels('systems-engineering');
    const systemsB = resolveOperateAssistantActionLabels('systems-engineering');
    const enterprise = resolveOperateAssistantActionLabels('enterprise-operations');
    const governance = resolveOperateAssistantActionLabels('governance');

    assert.deepEqual(systemsA, systemsB);
    assert.equal(systemsA.assistantLabel, 'Operations Assistant');
    assert.equal(systemsA.generateLabel, 'Generate System Options');
    assert.equal(enterprise.explainLabel, 'Improve This Process');
    assert.equal(governance.generateLabel, 'Generate Governance Options');
});

test('operate assistant action labels fail closed for unknown entries', () => {
    assert.deepEqual(
        resolveOperateAssistantActionLabels('unknown'),
        Object.freeze({
            assistantLabel: 'Assistant',
            recommendLabel: 'Ask Assistant',
            generateLabel: 'Generate Options',
            explainLabel: 'Improve This',
        }),
    );
});
