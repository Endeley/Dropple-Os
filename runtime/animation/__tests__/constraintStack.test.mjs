import test from 'node:test';
import assert from 'node:assert/strict';

import { applyConstraintStack } from '../constraints/applyConstraintStack.js';

test('limitRotation clamps rotation deterministically', () => {
    const nodes = {
        n1: { rotation: 10 },
    };
    const constraints = [
        {
            id: 'limit',
            type: 'limitRotation',
            target: 'n1',
            min: -1,
            max: 1,
        },
    ];

    const result = applyConstraintStack(nodes, constraints);

    assert.equal(result.n1.rotation, 1);
});

test('copyTransform copies values', () => {
    const nodes = {
        a: { x: 10, y: 20, rotation: 1 },
        b: { x: 0, y: 0, rotation: 0 },
    };
    const constraints = [
        {
            id: 'copy',
            type: 'copyTransform',
            source: 'a',
            target: 'b',
        },
    ];

    const result = applyConstraintStack(nodes, constraints);

    assert.equal(result.b.x, 10);
    assert.equal(result.b.rotation, 1);
});

test('aim constraint points toward target', () => {
    const nodes = {
        a: { x: 0, y: 0, rotation: 0 },
        b: { x: 0, y: 1 },
    };
    const constraints = [
        {
            id: 'aim',
            type: 'aim',
            target: 'a',
            lookAt: 'b',
        },
    ];

    const result = applyConstraintStack(nodes, constraints);

    assert.ok(result.a.rotation > 0);
});

test('constraint stack is deterministic', () => {
    const nodes = {
        n: { rotation: 2 },
    };
    const constraints = [
        {
            id: 'limit',
            type: 'limitRotation',
            target: 'n',
            min: -1,
            max: 1,
        },
    ];

    const left = applyConstraintStack(nodes, constraints);
    const right = applyConstraintStack(nodes, constraints);

    assert.deepEqual(left, right);
});

test('constraint stack orders by stage before priority', () => {
    const nodes = {
        a: { x: 0, y: 0, rotation: 10 },
        b: { x: 5, y: 5, rotation: 0 },
    };
    const constraints = [
        {
            id: 'postCopy',
            type: 'copyTransform',
            stage: 'post',
            priority: 100,
            source: 'a',
            target: 'b',
        },
        {
            id: 'preLimit',
            type: 'limitRotation',
            stage: 'pre',
            priority: 0,
            target: 'a',
            min: -1,
            max: 1,
        },
    ];

    const result = applyConstraintStack(nodes, constraints);

    assert.equal(result.a.rotation, 1);
    assert.equal(result.b.rotation, 1);
});

test('constraints only affect their explicit target nodes', () => {
    const nodes = {
        a: { x: 0, y: 0, rotation: 10 },
        b: { x: 2, y: 3, rotation: 4 },
    };
    const constraints = [
        {
            id: 'limit',
            type: 'limitRotation',
            target: 'a',
            min: -1,
            max: 1,
        },
    ];

    const result = applyConstraintStack(nodes, constraints);

    assert.equal(result.a.rotation, 1);
    assert.deepEqual(result.b, nodes.b);
});
