import test from 'node:test';
import assert from 'node:assert/strict';

import { applyGraphModifiers } from '../graph/applyGraphModifiers.js';

test('applyGraphModifiers preserves deterministic order by priority then id', () => {
    const layers = [
        { id: 'b', priority: 1, channels: [{ value: 1 }] },
        { id: 'a', priority: 1, channels: [{ value: 1 }] },
    ];

    const result = applyGraphModifiers(layers);

    assert.equal(result[0].id, 'a');
    assert.equal(result[1].id, 'b');
});

test('applyGraphModifiers applies explicit clamp only when defined', () => {
    const layers = [
        {
            id: 'test',
            channels: [{ value: 10 }],
            meta: { clamp: { min: 0, max: 1 } },
        },
    ];

    const result = applyGraphModifiers(layers);

    assert.equal(result[0].channels[0].value, 1);
});

test('applyGraphModifiers does not clamp when no clamp meta is present', () => {
    const layers = [
        {
            id: 'test',
            channels: [{ value: 10 }],
        },
    ];

    const result = applyGraphModifiers(layers);

    assert.equal(result[0].channels[0].value, 10);
});

test('applyGraphModifiers applies explicit scale and offset without mutating inputs', () => {
    const layers = [
        {
            id: 'test',
            channels: [{ value: 2 }],
            meta: { scale: 3, offset: 1 },
        },
    ];

    const before = JSON.stringify(layers);
    const result = applyGraphModifiers(layers);

    assert.equal(result[0].channels[0].value, 7);
    assert.equal(JSON.stringify(layers), before);
});

test('applyGraphModifiers is deterministic across runs', () => {
    const layers = [
        { id: 'x', priority: 2, channels: [{ value: 1 }] },
        { id: 'y', priority: 1, channels: [{ value: 2 }] },
    ];

    const left = applyGraphModifiers(layers);
    const right = applyGraphModifiers(layers);

    assert.deepEqual(left, right);
});

test('applyGraphModifiers applies explicit layer policy from context without mutating inputs', () => {
    const layers = [
        {
            id: 'graph:test',
            priority: 1,
            channels: [{ value: 2 }],
        },
    ];
    const before = JSON.stringify(layers);

    const result = applyGraphModifiers(layers, {
        graphLayerMeta: {
            'graph:test': {
                priority: 9,
                meta: {
                    scale: 2,
                },
            },
        },
    });

    assert.equal(result[0].priority, 9);
    assert.equal(result[0].channels[0].value, 4);
    assert.equal(JSON.stringify(layers), before);
});
