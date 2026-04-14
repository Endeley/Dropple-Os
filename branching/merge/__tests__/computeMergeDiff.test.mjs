import test from 'node:test';
import assert from 'node:assert/strict';

import { computeMergeDiff } from '@/branching/merge/computeMergeDiff.js';

test('computeMergeDiff classifies added, removed, and updated nodes', () => {
    const base = {
        keep: { x: 0, y: 0 },
        remove: { x: 1, y: 1 },
        update: { x: 5, y: 5 },
    };
    const source = {
        keep: { x: 0, y: 0 },
        add: { x: 10, y: 10 },
        update: { x: 20, y: 30 },
    };
    const target = {
        keep: { x: 0, y: 0 },
        add: { x: 8, y: 8 },
        update: { x: 15, y: 25 },
    };

    assert.deepEqual(computeMergeDiff(base, source, target), {
        added: [
            {
                nodeId: 'add',
                after: { x: 10, y: 10 },
            },
        ],
        removed: [
            {
                nodeId: 'remove',
                before: { x: 1, y: 1 },
            },
        ],
        updated: [
            {
                nodeId: 'update',
                before: { x: 15, y: 25 },
                after: { x: 20, y: 30 },
            },
        ],
    });
});

test('computeMergeDiff is deterministic across runs', () => {
    const base = {
        a: { x: 0, y: 0 },
    };
    const source = {
        a: { x: 5, y: 5 },
        b: { x: 10, y: 10 },
    };
    const target = {
        a: { x: 3, y: 3 },
    };

    assert.deepEqual(
        computeMergeDiff(base, source, target),
        computeMergeDiff(base, source, target),
    );
});

test('computeMergeDiff does not mutate its inputs', () => {
    const base = {
        a: { x: 0, y: 0 },
        b: { x: 1, y: 1 },
    };
    const source = {
        a: { x: 2, y: 2 },
        c: { x: 3, y: 3 },
    };
    const target = {
        a: { x: 4, y: 4 },
        c: { x: 5, y: 5 },
    };

    const baseBefore = structuredClone(base);
    const sourceBefore = structuredClone(source);
    const targetBefore = structuredClone(target);

    computeMergeDiff(base, source, target);

    assert.deepEqual(base, baseBefore);
    assert.deepEqual(source, sourceBefore);
    assert.deepEqual(target, targetBefore);
});
