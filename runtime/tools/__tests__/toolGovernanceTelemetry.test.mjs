import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createToolGovernanceAcceptTelemetry,
    createToolGovernanceRejectTelemetry,
} from '@/runtime/tools/toolGovernanceTelemetry.js';

test('governance telemetry normalizes toolIds deterministically and preserves schema parity', () => {
    const input = {
        source: ' capability.graph ',
        toolIds: ['b', 'a', 'a', ' ', null],
        atEventType: 'tools/register',
        currentTimeMs: 101,
    };

    const accept = createToolGovernanceAcceptTelemetry({
        ...input,
        code: 'tool-registration-approved',
        reason: 'dispatcher-ingress-governance-approved',
    });
    const reject = createToolGovernanceRejectTelemetry({
        ...input,
        code: 'tool-registration-recursive-sovereignty-blocked',
        reason: 'tool-registration-recursive-sovereignty-blocked',
    });

    assert.deepEqual(accept.payload.toolIds, ['a', 'b']);
    assert.deepEqual(reject.payload.toolIds, ['a', 'b']);
    assert.deepEqual(Object.keys(accept.payload).sort(), Object.keys(reject.payload).sort());
});

test('governance telemetry clamps unknown codes and reasons to bounded enum fallbacks', () => {
    const accept = createToolGovernanceAcceptTelemetry({
        code: 'unexpected',
        reason: 'freeform reason',
    });
    const reject = createToolGovernanceRejectTelemetry({
        code: 'unexpected',
        reason: 'freeform reason',
    });

    assert.equal(accept.payload.code, 'tool-registration-approved');
    assert.equal(accept.payload.reason, 'tool-registration-governance-approved');
    assert.equal(reject.payload.code, 'tool-registration-recursive-sovereignty-blocked');
    assert.equal(reject.payload.reason, 'tool-registration-recursive-sovereignty-blocked');
});
