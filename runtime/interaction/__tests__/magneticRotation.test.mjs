import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMagneticRotation } from '@/runtime/interaction/magneticRotation.js';

test('applyMagneticRotation blends toward snapped angle', () => {
    const raw = (42 * Math.PI) / 180;
    const snapped = (45 * Math.PI) / 180;
    const result = applyMagneticRotation(raw, snapped, {
        velocity: { speed: 0 },
        threshold: 6,
    });

    assert.ok(result > raw);
    assert.ok(result <= snapped);
});
