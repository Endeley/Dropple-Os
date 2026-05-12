import test from 'node:test';
import assert from 'node:assert/strict';

import {
    resolveSynthesizedToolProjection,
    resolveSynthesizedToolProjectionMap,
    resolveToolSemanticWinner,
} from '@/runtime/tools/resolveSynthesizedToolProjection.js';

test('resolveToolSemanticWinner deterministically selects the semantic winner by priority then source id', () => {
    const result = resolveToolSemanticWinner({
        owners: ['capability.beta', 'capability.alpha'],
        descriptorsBySource: {
            'capability.alpha': { id: 'move', label: 'Alpha Move', handlerFamily: 'session' },
            'capability.beta': { id: 'move', label: 'Beta Move', handlerFamily: 'session' },
        },
        sourcePriority: {
            'capability.alpha': 50,
            'capability.beta': 50,
        },
    });

    assert.equal(result.source, 'capability.alpha');
    assert.deepEqual(result.descriptor, {
        id: 'move',
        label: 'Alpha Move',
        handlerFamily: 'session',
    });
});

test('resolveSynthesizedToolProjection inherits default activation semantics only from the canonical winner', () => {
    const projection = resolveSynthesizedToolProjection({
        toolId: 'move',
        owners: ['capability.beta', 'capability.alpha'],
        descriptorsBySource: {
            'capability.alpha': { id: 'move', label: 'Alpha Move', handlerFamily: 'session', defaultActive: false },
            'capability.beta': { id: 'move', label: 'Beta Move', handlerFamily: 'session', defaultActive: true },
        },
        sourcePriority: {
            'capability.alpha': 100,
            'capability.beta': 50,
        },
    });

    assert.equal(projection.winnerSource, 'capability.alpha');
    assert.equal(projection.winnerPriority, 100);
    assert.equal(projection.descriptor.defaultActive, false);
});

test('resolveSynthesizedToolProjection rejects overlapping semantic identities with incompatible handler families', () => {
    const projection = resolveSynthesizedToolProjection({
        toolId: 'move',
        owners: ['capability.graph', 'capability.cinematic'],
        descriptorsBySource: {
            'capability.graph': { id: 'move', label: 'Move', handlerFamily: 'session' },
            'capability.cinematic': { id: 'move', label: 'Translate', handlerFamily: 'utility' },
        },
        sourcePriority: {
            'capability.graph': 100,
            'capability.cinematic': 50,
        },
    });

    assert.equal(projection.status, 'invalid');
    assert.equal(projection.invalidCode, 'handler-family-conflict');
    assert.equal(projection.winnerSource, null);
    assert.equal(projection.descriptor, null);
});

test('equivalent ownership topologies produce equivalent semantic projection regardless of owner order', () => {
    const a = resolveSynthesizedToolProjectionMap({
        ownership: {
            move: ['capability.beta', 'capability.alpha'],
        },
        registeredToolDescriptors: {
            'capability.alpha': {
                move: { id: 'move', label: 'Move', group: 'edit', handlerFamily: 'session' },
            },
            'capability.beta': {
                move: { id: 'move', label: 'Translate', group: 'edit', handlerFamily: 'session' },
            },
        },
        sourcePriority: {
            'capability.alpha': 100,
            'capability.beta': 50,
        },
    });
    const b = resolveSynthesizedToolProjectionMap({
        ownership: {
            move: ['capability.alpha', 'capability.beta'],
        },
        registeredToolDescriptors: {
            'capability.beta': {
                move: { id: 'move', label: 'Translate', group: 'edit', handlerFamily: 'session' },
            },
            'capability.alpha': {
                move: { id: 'move', label: 'Move', group: 'edit', handlerFamily: 'session' },
            },
        },
        sourcePriority: {
            'capability.beta': 50,
            'capability.alpha': 100,
        },
    });

    assert.deepEqual(a, b);
    assert.equal(a.move.status, 'valid');
    assert.equal(a.move.winnerSource, 'capability.alpha');
});
