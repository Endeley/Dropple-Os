import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateLayoutRoots } from '@/runtime/layout/evaluateLayoutRoots.js';

test('evaluateLayoutRoots walks the subtree and populates computed scene cache', () => {
    const document = {
        sceneGraph: {
            nodes: {
                root: { id: 'root', children: ['b', 'a'] },
                a: { id: 'a', children: [] },
                b: { id: 'b', children: ['c'] },
                c: { id: 'c', children: [] },
            },
        },
    };
    const runtime = {};

    evaluateLayoutRoots({
        roots: ['root'],
        document,
        runtime,
    });

    assert.deepEqual(Object.keys(runtime.scene.computed).sort(), ['a', 'b', 'c', 'root']);
});
