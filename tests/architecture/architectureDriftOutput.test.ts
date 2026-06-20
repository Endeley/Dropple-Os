import test from 'node:test';
import assert from 'node:assert/strict';

import { formatDriftReport, formatViolation } from '@/scripts/architectureDrift.mjs';
import { ARCHITECTURE_DRIFT_RULES } from '@/scripts/architectureDriftRules.mjs';

test('architecture drift output is stable for no-violation summary', () => {
    const report = formatDriftReport({
        violations: [],
        rules: ARCHITECTURE_DRIFT_RULES,
    });

    assert.equal(
        report,
        `Dropple Architecture Drift Check

No drift detected for the current high-confidence layer rules.
Rules Evaluated: 4
`,
    );
});

test('architecture drift output is stable for structured violation evidence', () => {
    const violation = {
        ruleId: 'DRIFT-003',
        legacyRuleId: 'runtime-imports-ui',
        ruleName: 'Runtime -> UI Import',
        description: 'Runtime layer must not import UI roots',
        owner: 'Shared Interaction Authority',
        law: 'CONSTITUTIONAL_STACK_V1.md',
        reason: 'Runtime must remain projection-independent.',
        suggestedFix:
            'Move the shared pure logic into a runtime-owned module or move the dependent test beside the UI implementation.',
        file: 'runtime/__tests__/contextMenuModel.test.mjs',
        lineNumber: 4,
        matchedSnippet: "import { resolveSelectionContextMenuModel } from '@/ui/canvas/contextMenuModel.js';",
    };

    assert.equal(
        formatViolation(violation),
        `------------------------------------------------------------
DRIFT-003

Rule
Runtime -> UI Import

File
runtime/__tests__/contextMenuModel.test.mjs:4

Matched Snippet
import { resolveSelectionContextMenuModel } from '@/ui/canvas/contextMenuModel.js';

Constitution
CONSTITUTIONAL_STACK_V1.md
Layer: Shared Interaction Authority

Reason
Runtime must remain projection-independent.

Suggested Fix
Move the shared pure logic into a runtime-owned module or move the dependent test beside the UI implementation.

Legacy Rule
runtime-imports-ui`,
    );

    const report = formatDriftReport({
        violations: [violation],
        rules: ARCHITECTURE_DRIFT_RULES,
    });

    assert.equal(
        report,
        `Dropple Architecture Drift Check

Architecture drift detected:

------------------------------------------------------------
DRIFT-003

Rule
Runtime -> UI Import

File
runtime/__tests__/contextMenuModel.test.mjs:4

Matched Snippet
import { resolveSelectionContextMenuModel } from '@/ui/canvas/contextMenuModel.js';

Constitution
CONSTITUTIONAL_STACK_V1.md
Layer: Shared Interaction Authority

Reason
Runtime must remain projection-independent.

Suggested Fix
Move the shared pure logic into a runtime-owned module or move the dependent test beside the UI implementation.

Legacy Rule
runtime-imports-ui
------------------------------------------------------------
Violations: 1
Rules Evaluated: 4
`,
    );
});

test('architecture drift rule registry uses stable identifiers', () => {
    const ids = ARCHITECTURE_DRIFT_RULES.map((rule) => rule.id);
    assert.deepEqual(ids, ['DRIFT-001', 'DRIFT-002', 'DRIFT-003', 'DRIFT-004']);
});
