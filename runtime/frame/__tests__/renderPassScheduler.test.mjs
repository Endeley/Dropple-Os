import test from 'node:test';
import assert from 'node:assert/strict';

import { createRenderGraphEnvelope } from '@/runtime/frame/renderGraphEnvelope.js';
import {
    createRenderPassExecutionEnvelope,
    runDeterministicRenderPasses,
} from '@/runtime/frame/renderPassScheduler.js';

test('render graph envelope canonicalizes pass ordering deterministically', () => {
    const envelope = createRenderGraphEnvelope({
        frameTime: 42,
        renderGraph: { nodes: [] },
        passes: [
            { passId: 'guides', order: 3 },
            { passId: 'design-canvas', order: 0 },
            { passId: 'snap-guides', order: 2 },
            { passId: 'selection-overlay', order: 1 },
            { passId: 'design-canvas', order: 99 },
        ],
    });

    assert.deepEqual(envelope.passIds, ['design-canvas', 'selection-overlay', 'snap-guides', 'guides']);
    assert.equal(typeof envelope.scheduleSignature, 'string');
    assert.equal(envelope.scheduleSignature.length > 0, true);
});

test('deterministic render pass scheduler runs bounded budget and resumes from checkpoint', () => {
    const envelope = createRenderGraphEnvelope({
        frameTime: 16,
        passes: [{ passId: 'a' }, { passId: 'b' }, { passId: 'c' }],
    });
    const executed = [];

    const first = runDeterministicRenderPasses({
        envelope,
        budgetPolicy: 'fixed',
        passBudget: 2,
        passHandlers: {
            a: () => executed.push('a'),
            b: () => executed.push('b'),
            c: () => executed.push('c'),
        },
    });
    assert.deepEqual(first.scheduledPassIds, ['a', 'b']);
    assert.deepEqual(executed, ['a', 'b']);
    assert.equal(first.completed, false);

    const second = runDeterministicRenderPasses({
        envelope,
        previousCheckpoint: first.checkpoint,
        budgetPolicy: 'all-remaining',
        passHandlers: {
            a: () => executed.push('a'),
            b: () => executed.push('b'),
            c: () => executed.push('c'),
        },
    });
    assert.deepEqual(second.scheduledPassIds, ['c']);
    assert.deepEqual(executed, ['a', 'b', 'c']);
    assert.equal(second.completed, true);
});

test('deterministic render pass scheduler fails closed on signature mismatch', () => {
    const envelope = createRenderGraphEnvelope({
        frameTime: 16,
        passes: [{ passId: 'a' }, { passId: 'b' }],
    });
    const baseline = createRenderPassExecutionEnvelope({ envelope });
    const mismatch = runDeterministicRenderPasses({
        envelope: createRenderGraphEnvelope({
            frameTime: 99,
            passes: [{ passId: 'b' }, { passId: 'a' }, { passId: 'c' }],
        }),
        previousCheckpoint: {
            scheduleSignature: baseline.scheduleSignature,
            partitionCursor: 1,
        },
        passHandlers: {},
    });

    assert.equal(mismatch.executionEnvelope.partitionCursor, 0);
    assert.deepEqual(mismatch.scheduledPassIds, ['a', 'b', 'c']);
});

