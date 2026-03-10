import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildDependencyGraph,
    propagateDirtyNodes,
} from '@/runtime/scene/index.js';

test('dirty propagation evaluates dependents deterministically', () => {
    const document = {
        sceneGraph: {
            nodes: {
                root: { id: 'root', children: ['a', 'b'] },
                a: { id: 'a', children: [] },
                b: { id: 'b', children: ['c'] },
                c: { id: 'c', children: [] },
            },
        },
    };

    const graph = buildDependencyGraph(document);
    const dirty = new Set(['c']);
    const propagated = propagateDirtyNodes(dirty, graph);

    assert.deepEqual([...propagated].sort(), ['b', 'c', 'root']);
});
