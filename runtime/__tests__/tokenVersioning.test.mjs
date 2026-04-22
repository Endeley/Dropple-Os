import test from 'node:test';
import assert from 'node:assert/strict';

import {
    appendTokenVersion,
    canRollbackToTokenVersion,
    detectCycles,
    normalizeParentVersionIds,
    resolveActiveVersionHead,
    rollbackTokenVersion,
    topologicalOrderVersions,
    validateMergeLegality,
    validateVersionGraph,
    listTokenVersions,
    wouldCreateVersionCycle,
} from '@/runtime/tokens/tokenVersioning.js';

test('token version ordering remains deterministic', () => {
    const v1 = appendTokenVersion(undefined, {
        id: 'v1',
        label: 'Initial',
        timestamp: 1,
    });

    const v2 = appendTokenVersion(v1, {
        id: 'v2',
        label: 'Dark theme',
        parentVersionIds: ['v1'],
        timestamp: 2,
    });

    assert.deepEqual(listTokenVersions(v2).map((entry) => entry.id), ['v1', 'v2']);
    assert.deepEqual(v2.order, ['v1', 'v2']);
});

test('token version rollback legality is gated by existing lineage', () => {
    const graph = appendTokenVersion(
        appendTokenVersion(undefined, {
            id: 'v1',
            label: 'Initial',
            timestamp: 1,
        }),
        {
            id: 'v2',
            label: 'Second',
            parentVersionIds: ['v1'],
            timestamp: 2,
        },
    );

    assert.equal(canRollbackToTokenVersion(graph, 'v1'), true);
    assert.equal(canRollbackToTokenVersion(graph, 'missing'), false);
});

test('token version lineage blocks cyclic ancestry deterministically', () => {
    assert.equal(
        wouldCreateVersionCycle(
            {
                v1: { id: 'v1', parentVersionIds: ['v2'] },
                v2: { id: 'v2', parentVersionIds: ['v1'] },
            },
            'v3',
            'v1',
        ),
        true,
    );

    const seed = appendTokenVersion(undefined, {
        id: 'v1',
        label: 'Initial',
        timestamp: 1,
    });

    assert.equal(
        appendTokenVersion(seed, {
            id: 'v2',
            parentVersionIds: ['v2'],
            timestamp: 2,
        }),
        seed,
    );
});

test('version graph rejects orphan parents and cycles explicitly', () => {
    assert.equal(
        validateVersionGraph({
            entries: {
                v1: { id: 'v1', parentVersionIds: ['missing'] },
            },
            order: ['v1'],
            activeVersionId: 'v1',
        }).ok,
        false,
    );

    assert.equal(
        detectCycles({
            entries: {
                v1: { id: 'v1', parentVersionIds: ['v2'] },
                v2: { id: 'v2', parentVersionIds: ['v1'] },
            },
            order: ['v1', 'v2'],
            activeVersionId: 'v2',
        }),
        true,
    );
});

test('merge legality requires ancestry-compatible parents and canonicalizes ordering', () => {
    const graph = appendTokenVersion(
        appendTokenVersion(undefined, {
            id: 'v1',
            timestamp: 1,
        }),
        {
            id: 'v2',
            parentVersionIds: ['v1'],
            timestamp: 2,
        },
    );

    const legal = validateMergeLegality(graph, ['v2', 'v1']);
    assert.equal(legal.ok, true);
    assert.deepEqual(legal.parentVersionIds, ['v1', 'v2']);

    const illegal = validateMergeLegality(
        {
            entries: {
                v1: { id: 'v1', parentVersionIds: [] },
                v2: { id: 'v2', parentVersionIds: [] },
            },
            order: ['v1', 'v2'],
            activeVersionId: 'v2',
        },
        ['v2', 'v1'],
    );
    assert.equal(illegal.ok, false);
});

test('topological version ordering and active head resolution remain deterministic', () => {
    const graph = appendTokenVersion(
        appendTokenVersion(
            appendTokenVersion(undefined, {
                id: 'v1',
                timestamp: 1,
            }),
            {
                id: 'v2',
                parentVersionIds: ['v1'],
                timestamp: 2,
            },
        ),
        {
            id: 'v3',
            parentVersionIds: ['v1', 'v2'],
            timestamp: 3,
            operation: 'merge',
        },
    );

    assert.deepEqual(topologicalOrderVersions(graph), ['v1', 'v2', 'v3']);
    assert.equal(resolveActiveVersionHead(graph), 'v3');

    const rolledBack = rollbackTokenVersion(graph, 'v1');
    assert.equal(resolveActiveVersionHead(rolledBack), 'v1');
    assert.deepEqual(normalizeParentVersionIds(['v2', 'v1', 'v2']), ['v1', 'v2']);
});
