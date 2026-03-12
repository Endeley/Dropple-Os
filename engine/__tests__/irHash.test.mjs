import test from 'node:test';
import assert from 'node:assert/strict';

import { hashIR } from '../ir/hashIR.js';

test('IR hash is deterministic', () => {
    const ir = {
        scene: {
            nodes: {
                a: { type: 'frame' },
                b: { type: 'text' },
            },
        },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    const hashA = hashIR(ir);
    const hashB = hashIR(ir);

    assert.equal(hashA, hashB);
});

test('IR hash changes when IR changes', () => {
    const irA = {
        scene: { nodes: { a: { type: 'frame' } } },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    const irB = {
        scene: { nodes: { a: { type: 'text' } } },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    const hashA = hashIR(irA);
    const hashB = hashIR(irB);

    assert.notEqual(hashA, hashB);
});
