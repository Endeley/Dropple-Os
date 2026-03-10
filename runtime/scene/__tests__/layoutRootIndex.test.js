import test from 'node:test';
import assert from 'node:assert/strict';

import { buildLayoutRootIndex } from '@/runtime/scene/layoutRootIndex.js';

test('layout root index resolves correct roots', () => {
    const document = {
        sceneGraph: {
            nodes: {
                root: { id: 'root', type: 'frame', parent: null, children: ['a', 'b'] },
                a: { id: 'a', parent: 'root', children: [] },
                b: { id: 'b', parent: 'root', children: ['c'] },
                c: { id: 'c', parent: 'b', children: [] },
            },
        },
    };

    const index = buildLayoutRootIndex(document);

    assert.equal(index.get('a'), 'root');
    assert.equal(index.get('b'), 'root');
    assert.equal(index.get('c'), 'root');
});
