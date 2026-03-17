import test from 'node:test';
import assert from 'node:assert/strict';

import { getNodeEvaluator } from '../graph/graphNodes.js';

test('getNodeEvaluator resolves math and procedural node evaluators', () => {
    assert.equal(typeof getNodeEvaluator('value'), 'function');
    assert.equal(typeof getNodeEvaluator('sin'), 'function');
    assert.equal(typeof getNodeEvaluator('clamp'), 'function');
});

test('clamp node limits channel values', () => {
    const clamp = getNodeEvaluator('clamp');

    const result = clamp(
        { id: 'clamp1', min: -5, max: 5 },
        {},
        [[
            {
                id: 'source',
                mode: 'replace',
                weight: 1,
                channels: [
                    { controllerId: 'arm_CTRL', channel: 'rotateX', value: 9 },
                ],
            },
        ]]
    );

    assert.equal(result[0].channels[0].value, 5);
});

test('remap node remaps channel values between ranges', () => {
    const remap = getNodeEvaluator('remap');

    const result = remap(
        { id: 'remap1', inMin: 0, inMax: 10, outMin: 0, outMax: 100 },
        {},
        [[
            {
                id: 'source',
                mode: 'replace',
                weight: 1,
                channels: [
                    { controllerId: 'arm_CTRL', channel: 'rotateX', value: 5 },
                ],
            },
        ]]
    );

    assert.equal(result[0].channels[0].value, 50);
});

test('time and sin nodes produce procedural channels from frame context', () => {
    const time = getNodeEvaluator('time');
    const sin = getNodeEvaluator('sin');

    const timeResult = time(
        { id: 'time1', controllerId: 'arm_CTRL', channel: 'rotateX' },
        { frame: 12 }
    );
    const sinResult = sin(
        {
            id: 'sin1',
            controllerId: 'arm_CTRL',
            channel: 'rotateY',
            amplitude: 2,
            frequency: 0,
            phase: 0,
        },
        { frame: 12 }
    );

    assert.equal(timeResult[0].channels[0].value, 12);
    assert.equal(sinResult[0].channels[0].value, 0);
});

test('getNodeEvaluator throws for unknown node types', () => {
    assert.throws(
        () => getNodeEvaluator('unknown'),
        /Unknown animation graph node type: unknown/
    );
});
