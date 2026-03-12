import test from 'node:test';
import assert from 'node:assert/strict';

import { validateIR } from '../ir/validateIR.js';

test('IR validation passes for valid IR', () => {
    const ir = {
        scene: {
            nodes: {
                a: { type: 'frame', children: ['b'] },
                b: { type: 'text', children: [] },
            },
        },
        components: {
            instances: {},
        },
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    assert.equal(validateIR(ir), true);
});

test('IR validation fails for missing section', () => {
    const ir = {
        scene: { nodes: {} },
    };

    assert.throws(() => validateIR(ir), /Missing IR section "components"/);
});

test('IR validation fails for missing child reference', () => {
    const ir = {
        scene: {
            nodes: {
                a: { type: 'frame', children: ['missing'] },
            },
        },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    assert.throws(() => validateIR(ir), /references missing child/);
});
