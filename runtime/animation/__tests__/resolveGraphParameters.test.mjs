import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveGraphParameters } from '../graph/resolveGraphParameters.js';

test('resolveGraphParameters lets injected parameters override defaults', () => {
    const result = resolveGraphParameters({
        graph: {
            parameters: {
                speed: { type: 'number', default: 0 },
            },
        },
        injected: { speed: 1 },
    });

    assert.equal(result.speed, 1);
});

test('resolveGraphParameters falls back to defaults when injected values are missing', () => {
    const result = resolveGraphParameters({
        graph: {
            parameters: {
                speed: { type: 'number', default: 0.5 },
            },
        },
        injected: {},
    });

    assert.equal(result.speed, 0.5);
});

test('resolveGraphParameters safely accepts injected values without definitions', () => {
    const result = resolveGraphParameters({
        graph: {},
        injected: { speed: 2 },
    });

    assert.equal(result.speed, 2);
});

test('resolveGraphParameters clamps number values to min and max', () => {
    const result = resolveGraphParameters({
        graph: {
            parameters: {
                speed: { type: 'number', min: 0, max: 1 },
            },
        },
        injected: { speed: 5 },
    });

    assert.equal(result.speed, 1);
});

test('resolveGraphParameters is deterministic across repeated runs', () => {
    const graph = {
        parameters: {
            b: { type: 'number', default: 2 },
            a: { type: 'number', default: 1 },
        },
    };
    const injected = { a: 10 };

    const left = resolveGraphParameters({ graph, injected });
    const right = resolveGraphParameters({ graph, injected });

    assert.deepEqual({ ...left }, { ...right });
});
