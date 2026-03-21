import test from 'node:test';
import assert from 'node:assert/strict';
import { snapAngle } from '@/runtime/interaction/snapAngle.js';

test('snapAngle snaps within threshold', () => {
    const result = snapAngle((44 * Math.PI) / 180, { step: 15, threshold: 5 });

    assert.equal(Math.round((result.angle * 180) / Math.PI), 45);
    assert.equal(result.snapped, true);
});
