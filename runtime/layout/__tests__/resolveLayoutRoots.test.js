import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveLayoutRoots } from '@/runtime/layout/resolveLayoutRoots.js';

test('resolveLayoutRoots returns sorted unique layout roots', () => {
    const index = new Map([
        ['a', 'root'],
        ['b', 'root'],
        ['c', 'frame-2'],
    ]);

    const roots = resolveLayoutRoots(['c', 'a', 'b'], index);

    assert.deepEqual(roots, ['frame-2', 'root']);
});
