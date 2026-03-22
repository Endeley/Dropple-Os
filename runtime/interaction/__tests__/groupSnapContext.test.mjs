import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGroupSnapContext } from '@/runtime/interaction/groupSnapContext.js';

test('group snap context normalizes projected group bounds', () => {
    const result = buildGroupSnapContext({
        x: 15,
        y: 10,
        width: 100,
        height: 80,
        center: { x: 65, y: 50 },
    });

    assert.deepEqual(result, {
        x: 15,
        y: 10,
        width: 100,
        height: 80,
        center: {
            x: 65,
            y: 50,
        },
    });
});
