import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDerivedEnvironmentDescriptor } from '@/domain/templates/DerivedEnvironmentDescriptor.js';
import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';
import { publishTemplateFromWorkspace } from '@/templates/publishTemplateFromWorkspace.js';
import {
    ArtifactExportKinds,
    buildRuntimeSnapshotFromArtifact,
    createArtifactPersistenceSnapshot,
    createEnvironmentArtifact,
    createSnapshotArtifact,
    exportArtifact,
} from '../exportArtifact.js';

function withTempRegistry(run) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-export-artifact-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    try {
        return run();
    } finally {
        process.chdir(originalCwd);
    }
}

async function withDownloadStubs(run) {
    const previousDocument = globalThis.document;
    const previousUrl = globalThis.URL;

    globalThis.document = {
        createElement() {
            return {
                href: '',
                download: '',
                click() {},
            };
        },
    };
    globalThis.URL = {
        createObjectURL() {
            return 'blob:test-export';
        },
        revokeObjectURL() {},
    };

    try {
        return await run();
    } finally {
        globalThis.document = previousDocument;
        globalThis.URL = previousUrl;
    }
}

function createDocument() {
    return {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: {
                    id: 'root',
                    type: 'frame',
                    children: [],
                },
            },
            activeSceneId: 'sceneA',
            scenes: [
                {
                    id: 'sceneA',
                    shots: [{ id: 'shotA', start: 0, duration: 1000, compositionId: 'root' }],
                },
            ],
        },
    };
}

function createDescriptor(rootSeed, versionId) {
    return createDerivedEnvironmentDescriptor({
        lineage: {
            lineageRootId: rootSeed.lineage.rootId,
            versionId,
        },
        environment: {
            overrides: {},
            runtimeConfig: {},
            modeContext: {
                workspaceId: 'design',
                modeId: 'graphic',
            },
        },
        metadata: {
            source: 'export-artifact-test',
        },
    });
}

test('environment artifact export deterministically rebuilds canonical output', async () =>
    withTempRegistry(async () => {
        const published = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Export Artifact Root',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const descriptor = createDescriptor(published.seed, published.seed.lineage.nodeId);
        const resolvedEnvironment = resolveTemplateEnvironment(descriptor);
        const artifact = createEnvironmentArtifact({
            descriptor,
            resolvedEnvironment,
        });

        const first = await withDownloadStubs(() =>
            exportArtifact({
                artifact,
                format: ArtifactExportKinds.JSON,
            }),
        );
        const second = await withDownloadStubs(() =>
            exportArtifact({
                artifact,
                format: ArtifactExportKinds.JSON,
            }),
        );

        assert.deepEqual(first.output, second.output);
    }));

test('snapshot artifact export deterministically resolves canonical output', async () => {
    const runtimeSnapshot = {
        document: {
            sceneGraph: {
                rootIds: ['root'],
                nodes: {
                    root: {
                        id: 'root',
                        type: 'frame',
                        children: [],
                    },
                },
                activeSceneId: 'sceneA',
                scenes: [
                    {
                        id: 'sceneA',
                        shots: [{ id: 'shotA', start: 0, duration: 1000, compositionId: 'root' }],
                    },
                ],
            },
        },
        timeline: {
            timelines: {
                default: { tracks: [], duration: 0, events: [] },
            },
        },
        scene: {
            activeSceneId: 'sceneA',
            activeShotId: 'shotA',
        },
        nodes: {},
        rootIds: ['root'],
    };
    const snapshotArtifact = createSnapshotArtifact({
        snapshot: runtimeSnapshot,
    });

    const first = await withDownloadStubs(() =>
        exportArtifact({
            artifact: snapshotArtifact,
            format: ArtifactExportKinds.JSON,
        }),
    );
    const second = await withDownloadStubs(() =>
        exportArtifact({
            artifact: snapshotArtifact,
            format: ArtifactExportKinds.JSON,
        }),
    );

    assert.deepEqual(first.output, second.output);
});

test('environment rebuild and equivalent snapshot runtime resolve to the same canonical spec', async () =>
    withTempRegistry(async () => {
        const published = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Export Artifact Equivalence',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const descriptor = createDescriptor(published.seed, published.seed.lineage.nodeId);
        const resolvedEnvironment = resolveTemplateEnvironment(descriptor);
        const environmentArtifact = createEnvironmentArtifact({
            descriptor,
            resolvedEnvironment,
        });
        const runtimeSnapshot = buildRuntimeSnapshotFromArtifact(environmentArtifact);
        const snapshotArtifact = createSnapshotArtifact({
            snapshot: runtimeSnapshot,
        });

        const environmentExport = await withDownloadStubs(() =>
            exportArtifact({
                artifact: environmentArtifact,
                format: ArtifactExportKinds.JSON,
            }),
        );
        const snapshotExport = await withDownloadStubs(() =>
            exportArtifact({
                artifact: snapshotArtifact,
                format: ArtifactExportKinds.JSON,
            }),
        );

        assert.deepEqual(environmentExport.output, snapshotExport.output);
    }));

test('createEnvironmentArtifact rejects partial publication context', () => {
    assert.throws(
        () =>
            createEnvironmentArtifact({
                descriptor: { environmentId: 'env-1', lineage: { lineageRootId: 'root', versionId: 'v1' } },
                resolvedEnvironment: null,
            }),
        /requires resolvedEnvironment/,
    );
});
