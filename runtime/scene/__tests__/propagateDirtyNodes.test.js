import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildDependencyGraph,
    propagateDirtyNodes,
} from '@/runtime/scene/index.js';

test('dirty propagation evaluates descendants deterministically', () => {
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
    const dirty = new Set(['b']);
    const propagated = propagateDirtyNodes(dirty, graph);

    assert.deepEqual([...propagated].sort(), ['b', 'c']);
});
