import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSurfaceIntentRoutingContract } from '@/runtime/osSurface/validateSurfaceIntentRouting.js';

test('os surface strict intent-routing matrix is deterministic and fail-closed', () => {
    const result = evaluateSurfaceIntentRoutingContract();
    assert.equal(result.ok, true);
    assert.equal(result.mutationFree, true);
    assert.equal(result.acceptedCount >= 4, true);
    assert.equal(result.rejectedCount >= 6, true);
    assert.deepEqual(result.failures, []);
});
