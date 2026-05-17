import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDerivedEnvironmentDescriptor } from '@/domain/templates/DerivedEnvironmentDescriptor.js';
import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';
import { registerTemplate } from '@/domain/templates/TemplateRegistry.js';
import { compileTemplateV1 } from '@/engine/templates/templateCompilerV1.js';
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

function createDocument(includeHeadline = false) {
    const nodes = {
        root: {
            id: 'root',
            type: 'frame',
            children: includeHeadline ? ['headline'] : [],
        },
    };

    if (includeHeadline) {
        nodes.headline = {
            id: 'headline',
            type: 'text',
            children: [],
        };
    }

    return {
        sceneGraph: {
            rootIds: ['root'],
            nodes,
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

function createTemplateArtifact(version = '1.0.0', includeHeadline = false) {
    const document = createDocument(includeHeadline);

    return {
        metadata: {
            id: 'tpl.runtime.export-artifact',
            version,
            name: 'Export Artifact Fixture',
            engine: 'dropple-motion@1.x',
            author: 'Dropple',
            license: 'dropple-marketplace-standard',
            createdAt: '2026-05-05',
            description: 'Runtime export artifact fixture',
        },
        structure: {
            root: 'root',
            nodes: Object.values(document.sceneGraph.nodes).map((node) => ({
                id: node.id,
                type: node.id === 'root' ? 'Scene' : 'Text',
            })),
            tree: {
                root: [],
            },
        },
        motion: {
            timelines: {
                intro: {
                    duration: 1000,
                    tracks: [
                        {
                            target: 'root',
                            property: 'opacity',
                            keyframes: [
                                { t: 0, v: 0.5 },
                                { t: 1000, v: 1 },
                            ],
                        },
                    ],
                },
            },
            triggers: {
                onLoad: 'intro',
            },
        },
        params: {},
        runtime: {
            viewport: ['desktop'],
            autoplay: true,
        },
    };
}

function registerPublishedSeed(version = '1.0.0', includeHeadline = false) {
    const seed = compileTemplateV1(createTemplateArtifact(version, includeHeadline)).seed;

    registerTemplate({
        template: seed,
        engineVersion: seed.certification.engineVersion,
    });

    return seed;
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
        const seed = registerPublishedSeed('1.0.0');
        const descriptor = createDescriptor(seed, seed.lineage.nodeId);
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
        assert.equal(first.exportHash, second.exportHash);
        assert.equal(first.algorithm, second.algorithm);
        assert.equal(first.canonicalVersion, second.canonicalVersion);
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
        runtime: {
            federationAudit: {
                entries: [{ type: 'runtime.federation.audit', sessionId: 'fed-snap', status: 'accepted' }],
                hash: 'fed-snap-hash',
                maxEntries: 256,
            },
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
    assert.equal(first.exportHash, second.exportHash);
    assert.deepEqual(first.federationAuditAttestation, second.federationAuditAttestation);
    assert.equal(first.federationAuditAttestation?.hash, 'fed-snap-hash');
    assert.equal(first.federationAuditAttestation?.entryCount, 1);
});

test('environment rebuild and equivalent snapshot runtime resolve to the same canonical spec', async () =>
    withTempRegistry(async () => {
        const seed = registerPublishedSeed('1.0.0');
        const descriptor = createDescriptor(seed, seed.lineage.nodeId);
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
        assert.equal(environmentExport.exportHash, snapshotExport.exportHash);
    }));

test('structural change produces a different export hash', async () =>
    withTempRegistry(async () => {
        const firstSeed = registerPublishedSeed('1.0.0', false);
        const firstDescriptor = createDescriptor(firstSeed, firstSeed.lineage.nodeId);
        const firstArtifact = createEnvironmentArtifact({
            descriptor: firstDescriptor,
            resolvedEnvironment: resolveTemplateEnvironment(firstDescriptor),
        });

        const secondSeed = registerPublishedSeed('2.0.0', true);
        const secondDescriptor = createDerivedEnvironmentDescriptor({
            lineage: {
                lineageRootId: secondSeed.lineage.rootId,
                versionId: secondSeed.lineage.nodeId,
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
                source: 'export-artifact-test-structural-change',
            },
        });
        const secondArtifact = createEnvironmentArtifact({
            descriptor: secondDescriptor,
            resolvedEnvironment: resolveTemplateEnvironment(secondDescriptor),
        });

        const firstExport = await withDownloadStubs(() =>
            exportArtifact({
                artifact: firstArtifact,
                format: ArtifactExportKinds.JSON,
                options: { download: false },
            }),
        );
        const secondExport = await withDownloadStubs(() =>
            exportArtifact({
                artifact: secondArtifact,
                format: ArtifactExportKinds.JSON,
                options: { download: false },
            }),
        );

        assert.notEqual(firstExport.exportHash, secondExport.exportHash);
    }));

test('canonical export entrypoint enforces strict simulation trace attestation when verification is enabled', async () => {
    const snapshotArtifact = createSnapshotArtifact({
        snapshot: {
            document: createDocument(),
            runtime: {
                simulation: {
                    trace: {
                        entries: [
                            {
                                tickTime: 16,
                                deltaTime: 16,
                                simulationHash: 'sim-a',
                                entityCount: 1,
                                constraintLayerSignature: 'layer-a',
                                primitiveTrace: [
                                    {
                                        type: 'entity.spring-step',
                                        entityId: 'root',
                                        spring: 24,
                                        damping: 9,
                                    },
                                ],
                            },
                        ],
                    },
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
        },
    });

    await assert.doesNotReject(() =>
        withDownloadStubs(() =>
                exportArtifact({
                    artifact: snapshotArtifact,
                    format: ArtifactExportKinds.JSON,
                    options: {
                        download: false,
                        verification: { enabled: true },
                    },
                }),
        ),
    );

    const tampered = createSnapshotArtifact({
        snapshot: {
            ...snapshotArtifact.snapshot,
            runtime: {
                simulation: {
                    trace: {
                        entries: [
                            {
                                tickTime: 16,
                                deltaTime: 16,
                                simulationHash: 'sim-a',
                                entityCount: 1,
                                constraintLayerSignature: 'layer-a',
                            },
                        ],
                    },
                },
            },
        },
    });

    await assert.rejects(
        () =>
            withDownloadStubs(() =>
                exportArtifact({
                    artifact: tampered,
                    format: ArtifactExportKinds.JSON,
                    options: {
                        download: false,
                        verification: { enabled: true },
                    },
                }),
            ),
        /Export attestation failed/,
    );
});

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
