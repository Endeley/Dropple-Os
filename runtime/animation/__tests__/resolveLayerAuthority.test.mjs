import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveLayerAuthority } from '../graph/resolveLayerAuthority.js';

test('resolveLayerAuthority lets higher priority replace win', () => {
    const result = resolveLayerAuthority([
        {
            id: 'low',
            priority: 1,
            mode: 'replace',
            channels: [{ controllerId: 'c', channel: 'x', value: 1 }],
        },
        {
            id: 'high',
            priority: 10,
            mode: 'replace',
            channels: [{ controllerId: 'c', channel: 'x', value: 5 }],
        },
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0].value, 5);
});

test('resolveLayerAuthority accumulates add mode deterministically', () => {
    const result = resolveLayerAuthority([
        {
            id: 'a',
            priority: 1,
            mode: 'add',
            channels: [{ controllerId: 'c', channel: 'x', value: 2 }],
        },
        {
            id: 'b',
            priority: 1,
            mode: 'add',
            channels: [{ controllerId: 'c', channel: 'x', value: 3 }],
        },
    ]);

    assert.equal(result[0].value, 5);
});

test('resolveLayerAuthority filters channels through explicit masks', () => {
    const result = resolveLayerAuthority([
        {
            id: 'mask',
            priority: 10,
            mode: 'replace',
            meta: { mask: { channels: ['x'] } },
            channels: [
                { controllerId: 'c', channel: 'x', value: 10 },
                { controllerId: 'c', channel: 'y', value: 20 },
            ],
        },
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0].channel, 'x');
});

test('resolveLayerAuthority is deterministic across runs', () => {
    const layers = [
        {
            id: 'x',
            priority: 2,
            mode: 'replace',
            channels: [{ controllerId: 'c', channel: 'x', value: 1 }],
        },
        {
            id: 'y',
            priority: 1,
            mode: 'add',
            channels: [{ controllerId: 'c', channel: 'x', value: 2 }],
        },
    ];

    const left = resolveLayerAuthority(layers);
    const right = resolveLayerAuthority(layers);

    assert.deepEqual(left, right);
});
