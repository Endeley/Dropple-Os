import test from 'node:test';
import assert from 'node:assert/strict';

import { exportReact } from '../export/react/exportReact.js';

test('reactCompiler produces deterministic output', () => {
    const ir = {
        scene: {
            nodes: {
                a: { type: 'frame', layout: { width: 100, height: 100 } },
                b: { type: 'text', text: 'Hello' },
            },
        },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    const resultA = exportReact(ir);
    const resultB = exportReact(ir);

    assert.equal(resultA.code, resultB.code);
    assert.equal(resultA.fingerprint, resultB.fingerprint);
});

test('reactCompiler output changes when IR changes', () => {
    const irA = {
        scene: { nodes: { a: { type: 'text', text: 'A' } } },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    const irB = {
        scene: { nodes: { a: { type: 'text', text: 'B' } } },
        components: {},
        motion: {},
        interactions: {},
        semantics: {},
        state: {},
    };

    const outA = exportReact(irA);
    const outB = exportReact(irB);

    assert.notEqual(outA.code, outB.code);
});
