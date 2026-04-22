import test from 'node:test';
import assert from 'node:assert/strict';

import {
    appendTokenVersion,
    detectCycles,
    normalizeParentVersionIds,
    resolveActiveVersionHead,
    rollbackTokenVersion,
    topologicalOrderVersions,
    validateMergeLegality,
    validateVersionGraph,
} from '@/runtime/tokens/tokenVersionGraph.js';

test('token version graph blocks cycles and orphans', () => {
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

test('token version graph validates fast-forward merge legality with canonical parent ordering', () => {
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
    assert.deepEqual(normalizeParentVersionIds(['v2', 'v1', 'v2']), ['v1', 'v2']);

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

test('token version graph topological ordering and active head resolution remain deterministic', () => {
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
    assert.equal(rolledBack.activeVersionId, 'v1');
});

