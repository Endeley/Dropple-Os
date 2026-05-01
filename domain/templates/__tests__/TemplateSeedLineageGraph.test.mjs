import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
    createTemplateSeedLineageGraph,
    createTemplateSeedLineageNode,
    deriveTemplateSeedLineageNodeId,
    validateTemplateSeedLineageEntries,
} from '../TemplateSeedLineageGraph.js';

function hashContent(label) {
    return crypto.createHash('sha256').update(label).digest('hex');
}

test('template seed lineage graph is deterministic for the same normalized inputs', () => {
    const seed = createTemplateSeedLineageNode({
        type: 'seed',
        contentHash: hashContent('seed'),
    });
    const version = createTemplateSeedLineageNode({
        type: 'version',
        parentIds: [seed.id],
        contentHash: hashContent('version'),
    });
    const fork = createTemplateSeedLineageNode({
        type: 'fork',
        parentIds: [version.id],
        contentHash: hashContent('fork'),
    });

    const graphA = createTemplateSeedLineageGraph([fork, seed, version]);
    const graphB = createTemplateSeedLineageGraph([version, fork, seed]);

    assert.equal(graphA.graphHash, graphB.graphHash);
    assert.deepEqual(graphA.getTopoOrder(), graphB.getTopoOrder());
});

test('template seed lineage graph rejects cycles strictly', () => {
    const seedId = hashContent('cycle-seed-id');
    const versionId = hashContent('cycle-version-id');

    assert.throws(
        () =>
            validateTemplateSeedLineageEntries({
                [seedId]: {
                    id: seedId,
                    type: 'seed',
                    contentHash: hashContent('cycle-seed-content'),
                    parentVersionIds: [versionId],
                },
                [versionId]: {
                    id: versionId,
                    type: 'version',
                    contentHash: hashContent('cycle-version-content'),
                    parentVersionIds: [seedId],
                },
            }),
        /contains a cycle|invalid: cyclic version graph/i,
    );
});

test('template seed lineage node ids normalize parent ordering deterministically', () => {
    const parentA = hashContent('parent-a');
    const parentB = hashContent('parent-b');
    const contentHash = hashContent('merge-content');

    const idA = deriveTemplateSeedLineageNodeId({
        type: 'merge',
        parentIds: [parentA, parentB],
        contentHash,
    });
    const idB = deriveTemplateSeedLineageNodeId({
        type: 'merge',
        parentIds: [parentB, parentA],
        contentHash,
    });

    assert.equal(idA, idB);
});

test('template seed lineage graph returns stable ordered ancestry chains', () => {
    const seed = createTemplateSeedLineageNode({
        type: 'seed',
        contentHash: hashContent('ancestor-seed'),
    });
    const version = createTemplateSeedLineageNode({
        type: 'version',
        parentIds: [seed.id],
        contentHash: hashContent('ancestor-version'),
    });
    const fork = createTemplateSeedLineageNode({
        type: 'fork',
        parentIds: [version.id],
        contentHash: hashContent('ancestor-fork'),
    });
    const merge = createTemplateSeedLineageNode({
        type: 'merge',
        parentIds: [fork.id, version.id],
        contentHash: hashContent('ancestor-merge'),
    });

    const graph = createTemplateSeedLineageGraph([seed, version, fork, merge]);

    assert.deepEqual(
        graph.getAncestors(merge.id).map((node) => node.id),
        [seed.id, version.id, fork.id],
    );
    assert.deepEqual(
        graph.getAncestors(merge.id).map((node) => node.id),
        [seed.id, version.id, fork.id],
    );
});
