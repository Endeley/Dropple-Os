import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { publishTemplateFromWorkspace } from './publishTemplateFromWorkspace.js';
import { publishTemplateFork } from './publishTemplateFork.js';
import { buildTemplateMergeSeed, publishTemplateMerge } from './publishTemplateMerge.js';
import { getByVersionId, getLineageRoot, listLineageVersions } from '../domain/templates/TemplateRegistry.js';

function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

function createDocument(opacityTarget = 1) {
    return {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: {
                    id: 'root',
                    type: 'frame',
                    children: ['headline'],
                },
                headline: {
                    id: 'headline',
                    type: 'text',
                    children: [],
                },
            },
        },
        motion: {
            clips: {
                'clip-headline-opacity': {
                    id: 'clip-headline-opacity',
                    target: 'headline',
                    property: 'opacity',
                    keyframes: [
                        { id: 'kf-0', t: 0, v: 0 },
                        { id: 'kf-500', t: 500, v: opacityTarget, easing: 'ease-in' },
                    ],
                },
            },
        },
    };
}

function createDerivedSnapshot(parentSeed, version, mutateLastOpacity) {
    const states = clone(parentSeed.states);
    const defaultState = parentSeed.defaultState;
    states[defaultState].channels = states[defaultState].channels.map((channel) => (
        channel.id === 'opacity'
            ? {
                ...channel,
                keyframes: channel.keyframes.map((keyframe, index, list) => (
                    index === list.length - 1
                        ? { ...keyframe, value: mutateLastOpacity }
                        : keyframe
                )),
            }
            : channel
    ));

    return {
        id: parentSeed.id,
        version,
        baseSceneGraph: clone(parentSeed.baseSceneGraph),
        states,
        defaultState,
        params: clone(parentSeed.params),
        metadata: clone(parentSeed.metadata),
    };
}

test('publishTemplateFork requires explicit snapshot-owned seed slices', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-merge-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const published = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Fork Contract Parent',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });

        assert.throws(
            () =>
                publishTemplateFork({
                    parentVersionId: published.seed.lineage.nodeId,
                    snapshot: {
                        version: '1.1.0',
                        defaultState: published.seed.defaultState,
                        params: clone(published.seed.params),
                        baseSceneGraph: clone(published.seed.baseSceneGraph),
                    },
                    engineVersion: published.seed.certification.engineVersion,
                }),
            /snapshot\.states is required/,
        );
    } finally {
        process.chdir(originalCwd);
    }
});

test('publishTemplateMerge derives symmetric deterministic identity for the same parents and snapshot', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-merge-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const root = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Merge Root',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const forkA = publishTemplateFork({
            parentVersionId: root.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(root.seed, '1.1.0', 0.5),
            engineVersion: root.seed.certification.engineVersion,
        });
        const forkB = publishTemplateFork({
            parentVersionId: root.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(root.seed, '1.2.0', 0.75),
            engineVersion: root.seed.certification.engineVersion,
        });
        const mergeSnapshot = createDerivedSnapshot(root.seed, '1.3.0', 0.9);

        const mergeAB = buildTemplateMergeSeed({
            parentVersionIds: [forkA.seed.lineage.nodeId, forkB.seed.lineage.nodeId],
            snapshot: mergeSnapshot,
            engineVersion: root.seed.certification.engineVersion,
        });
        const mergeBA = buildTemplateMergeSeed({
            parentVersionIds: [forkB.seed.lineage.nodeId, forkA.seed.lineage.nodeId],
            snapshot: mergeSnapshot,
            engineVersion: root.seed.certification.engineVersion,
        });

        assert.deepEqual(mergeAB.normalizedParents, mergeBA.normalizedParents);
        assert.equal(mergeAB.seed.lineage.nodeId, mergeBA.seed.lineage.nodeId);
        assert.equal(mergeAB.seed.contentHash, mergeBA.seed.contentHash);
    } finally {
        process.chdir(originalCwd);
    }
});

test('publishTemplateMerge rejects cross-root, duplicate-parent, and ancestor-related merges', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-merge-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const rootA = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                id: 'tpl.merge.a',
                title: 'Merge Root A',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const rootB = publishTemplateFromWorkspace({
            document: createDocument(0.8),
            metadata: {
                id: 'tpl.merge.b',
                title: 'Merge Root B',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const childA = publishTemplateFork({
            parentVersionId: rootA.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(rootA.seed, '1.1.0', 0.5),
            engineVersion: rootA.seed.certification.engineVersion,
        });

        assert.throws(
            () =>
                buildTemplateMergeSeed({
                    parentVersionIds: [rootA.seed.lineage.nodeId, rootB.seed.lineage.nodeId],
                    snapshot: createDerivedSnapshot(rootA.seed, '1.2.0', 0.85),
                    engineVersion: rootA.seed.certification.engineVersion,
                }),
            /same lineageRootId/,
        );

        assert.throws(
            () =>
                buildTemplateMergeSeed({
                    parentVersionIds: [rootA.seed.lineage.nodeId, rootA.seed.lineage.nodeId],
                    snapshot: createDerivedSnapshot(rootA.seed, '1.2.0', 0.85),
                    engineVersion: rootA.seed.certification.engineVersion,
                }),
            /duplicate parentVersionIds/,
        );

        assert.throws(
            () =>
                buildTemplateMergeSeed({
                    parentVersionIds: [rootA.seed.lineage.nodeId, childA.seed.lineage.nodeId],
                    snapshot: createDerivedSnapshot(rootA.seed, '1.2.0', 0.85),
                    engineVersion: rootA.seed.certification.engineVersion,
                }),
            /parent ancestry conflict/,
        );
    } finally {
        process.chdir(originalCwd);
    }
});

test('publishTemplateMerge certifies and appends a lawful merge into the domain registry', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-merge-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const root = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Merge Root',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const forkA = publishTemplateFork({
            parentVersionId: root.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(root.seed, '1.1.0', 0.5),
            engineVersion: root.seed.certification.engineVersion,
        });
        const forkB = publishTemplateFork({
            parentVersionId: root.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(root.seed, '1.2.0', 0.75),
            engineVersion: root.seed.certification.engineVersion,
        });

        const merge = publishTemplateMerge({
            parentVersionIds: [forkB.seed.lineage.nodeId, forkA.seed.lineage.nodeId],
            snapshot: createDerivedSnapshot(root.seed, '1.3.0', 0.95),
            engineVersion: root.seed.certification.engineVersion,
        });

        assert.equal(merge.seed.certification.certified, true);
        assert.equal(merge.seed.certification.lineageRootId, root.seed.lineage.rootId);
        assert.deepEqual(merge.seed.lineage.parentIds, [
            forkA.seed.lineage.nodeId,
            forkB.seed.lineage.nodeId,
        ]);
        assert.equal(getByVersionId(merge.seed.lineage.nodeId)?.version, '1.3.0');
        assert.deepEqual(getLineageRoot(root.seed.lineage.rootId)?.versionIds, [
            root.seed.lineage.nodeId,
            forkA.seed.lineage.nodeId,
            forkB.seed.lineage.nodeId,
            merge.seed.lineage.nodeId,
        ]);
        assert.deepEqual(
            listLineageVersions(root.seed.lineage.rootId).map((entry) => entry.version),
            ['1.0.0', '1.1.0', '1.2.0', '1.3.0'],
        );
    } finally {
        process.chdir(originalCwd);
    }
});
