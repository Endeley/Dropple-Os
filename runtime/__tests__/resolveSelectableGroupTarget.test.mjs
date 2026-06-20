import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveSelectableGroupTarget } from '@/runtime/grouping/resolveSelectableGroupTarget.js';

test('returns same node id when node is not inside a group', () => {
    const nodesById = {
        a: { id: 'a', type: 'frame', parentId: null },
    };

    assert.equal(resolveSelectableGroupTarget(nodesById, 'a'), 'a');
});

test('resolves child hit to nearest group ancestor', () => {
    const nodesById = {
        'group-1': { id: 'group-1', type: 'group', parentId: null, children: ['a', 'b'] },
        a: { id: 'a', type: 'frame', parentId: 'group-1' },
        b: { id: 'b', type: 'frame', parentId: 'group-1' },
    };

    assert.equal(resolveSelectableGroupTarget(nodesById, 'a'), 'group-1');
    assert.equal(resolveSelectableGroupTarget(nodesById, 'b'), 'group-1');
    assert.equal(resolveSelectableGroupTarget(nodesById, 'group-1'), 'group-1');
});
