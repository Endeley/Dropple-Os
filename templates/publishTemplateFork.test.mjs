import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { publishTemplateFromWorkspace } from './publishTemplateFromWorkspace.js';
import { buildTemplateForkSeed, publishTemplateFork } from './publishTemplateFork.js';
import { getByVersionId, getLineageRoot, listLineageVersions } from '../domain/templates/TemplateRegistry.js';

function createDocument() {
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
                        { id: 'kf-500', t: 500, v: 1, easing: 'ease-in' },
                    ],
                },
            },
        },
    };
}

function createForkSnapshot(parentSeed, overrides = {}) {
    const states = overrides.states ?? parentSeed.states;
    return {
        id: overrides.id ?? parentSeed.id,
        version: overrides.version ?? '1.1.0',
        baseSceneGraph: overrides.baseSceneGraph ?? parentSeed.baseSceneGraph,
        states,
        defaultState: overrides.defaultState ?? parentSeed.defaultState,
        params: overrides.params ?? parentSeed.params,
        metadata: {
            ...(parentSeed.metadata ?? {}),
            ...(overrides.metadata ?? {}),
        },
    };
}

test('publishTemplateFork derives deterministic fork identity from parent lineage and snapshot content', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-fork-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const published = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Fork Parent Template',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });

        const snapshot = createForkSnapshot(published.seed, {
            version: '1.1.0',
        });

        const forkA = buildTemplateForkSeed({
            parentVersionId: published.seed.lineage.nodeId,
            snapshot,
            engineVersion: published.seed.certification.engineVersion,
        });
        const forkB = buildTemplateForkSeed({
            parentVersionId: published.seed.lineage.nodeId,
            snapshot,
            engineVersion: published.seed.certification.engineVersion,
        });

        assert.equal(forkA.seed.lineage.rootId, published.seed.lineage.rootId);
        assert.deepEqual(forkA.seed.lineage.parentIds, [published.seed.lineage.nodeId]);
        assert.equal(forkA.seed.lineage.nodeId, forkB.seed.lineage.nodeId);
        assert.equal(forkA.seed.contentHash, forkB.seed.contentHash);
    } finally {
        process.chdir(originalCwd);
    }
});

test('publishTemplateFork rejects unknown parents and changes identity when snapshot content changes', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-fork-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const published = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Fork Parent Template',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });

        assert.throws(
            () =>
                buildTemplateForkSeed({
                    parentVersionId: 'missing-parent-version',
                    snapshot: createForkSnapshot(published.seed, {
                        version: '1.1.0',
                    }),
                }),
            /Unknown fork parent version/,
        );

        const changedStates = structuredClone
            ? structuredClone(published.seed.states)
            : JSON.parse(JSON.stringify(published.seed.states));
        changedStates[published.seed.defaultState].channels = changedStates[
            published.seed.defaultState
        ].channels.map((channel) => (
            channel.id === 'opacity'
                ? {
                    ...channel,
                    keyframes: channel.keyframes.map((keyframe, index) => (
                        index === channel.keyframes.length - 1
                            ? { ...keyframe, value: 0.5 }
                            : keyframe
                    )),
                }
                : channel
        ));

        const originalFork = buildTemplateForkSeed({
            parentVersionId: published.seed.lineage.nodeId,
            snapshot: createForkSnapshot(published.seed, {
                version: '1.1.0',
            }),
        });
        const changedFork = buildTemplateForkSeed({
            parentVersionId: published.seed.lineage.nodeId,
            snapshot: createForkSnapshot(published.seed, {
                version: '1.1.0',
                states: changedStates,
            }),
        });

        assert.notEqual(originalFork.seed.contentHash, changedFork.seed.contentHash);
        assert.notEqual(originalFork.seed.lineage.nodeId, changedFork.seed.lineage.nodeId);
    } finally {
        process.chdir(originalCwd);
    }
});

test('publishTemplateFork certifies and appends a lawful derived version into the domain registry', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-fork-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const published = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Fork Parent Template',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });

        const fork = publishTemplateFork({
            parentVersionId: published.seed.lineage.nodeId,
            snapshot: createForkSnapshot(published.seed, {
                version: '1.1.0',
            }),
            engineVersion: published.seed.certification.engineVersion,
        });

        assert.equal(fork.seed.certification.certified, true);
        assert.equal(fork.seed.certification.lineageRootId, published.seed.lineage.rootId);
        assert.deepEqual(fork.seed.lineage.parentIds, [published.seed.lineage.nodeId]);
        assert.equal(
            getByVersionId(fork.seed.lineage.nodeId)?.version,
            '1.1.0',
        );
        assert.deepEqual(getLineageRoot(published.seed.lineage.rootId)?.versionIds, [
            published.seed.lineage.nodeId,
            fork.seed.lineage.nodeId,
        ]);
        assert.deepEqual(
            listLineageVersions(published.seed.lineage.rootId).map((entry) => entry.version),
            ['1.0.0', '1.1.0'],
        );
    } finally {
        process.chdir(originalCwd);
    }
});
