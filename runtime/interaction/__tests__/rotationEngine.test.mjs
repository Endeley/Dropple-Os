import test from 'node:test';
import assert from 'node:assert/strict';
import { computeRotationDelta } from '@/runtime/interaction/rotationEngine.js';

test('computeRotationDelta returns correct angle', () => {
    const result = computeRotationDelta({
        startPointer: { x: 1, y: 0 },
        currentPointer: { x: 0, y: 1 },
        rotation: {
            originAngle: 0,
            center: { x: 0, y: 0 },
        },
    });

    assert.ok(result.angle > 1.4 && result.angle < 1.7);
});
