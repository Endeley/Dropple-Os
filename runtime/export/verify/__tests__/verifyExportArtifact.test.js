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
    createEnvironmentArtifact,
    createSnapshotArtifact,
    buildRuntimeSnapshotFromArtifact,
    exportArtifact,
} from '../../exportArtifact.js';
import { verifyExportArtifact } from '../verifyExportArtifact.js';

function withTempRegistry(run) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-verify-export-artifact-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    try {
        return run();
    } finally {
        process.chdir(originalCwd);
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

function createTemplateArtifact(version = '1.0.0') {
    return {
        metadata: {
            id: 'tpl.runtime.verify-export-artifact',
            version,
            name: 'Verify Export Artifact Fixture',
            engine: 'dropple-motion@1.x',
            author: 'Dropple',
            license: 'dropple-marketplace-standard',
            createdAt: '2026-05-06',
            description: 'Runtime export verification fixture',
        },
        structure: {
            root: 'root',
            nodes: [{ id: 'root', type: 'Scene' }],
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
                                { t: 0, v: 0.25 },
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

function registerPublishedSeed(version = '1.0.0') {
    const seed = compileTemplateV1(createTemplateArtifact(version)).seed;
    registerTemplate({
        template: seed,
        engineVersion: seed.certification.engineVersion,
    });
    return seed;
}

function createDescriptor(seed) {
    return createDerivedEnvironmentDescriptor({
        lineage: {
            lineageRootId: seed.lineage.rootId,
            versionId: seed.lineage.nodeId,
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
            source: 'verify-export-artifact-test',
        },
    });
}

test('verifyExportArtifact validates an environment export fingerprint', async () =>
    withTempRegistry(async () => {
        const seed = registerPublishedSeed('1.0.0');
        const descriptor = createDescriptor(seed);
        const artifact = createEnvironmentArtifact({
            descriptor,
            resolvedEnvironment: resolveTemplateEnvironment(descriptor),
        });
        const exported = await exportArtifact({
            artifact,
            format: ArtifactExportKinds.JSON,
            options: { download: false },
        });

        const verification = await verifyExportArtifact({
            artifact,
            format: exported.format,
            output: exported.output,
            exportHash: exported.exportHash,
            simulationTraceFingerprint: exported.simulationTraceFingerprint,
            canonicalVersion: exported.canonicalVersion,
            algorithm: exported.algorithm,
            options: { download: false },
        });

        assert.equal(verification.valid, true);
        assert.equal(verification.hashMatches, true);
        assert.equal(verification.capabilityMatches, true);
        assert.equal(verification.reproductionMatches, true);
        assert.equal(verification.traceFingerprintMatches, true);
    }));

test('verifyExportArtifact validates equivalent snapshot export identity', async () =>
    withTempRegistry(async () => {
        const seed = registerPublishedSeed('1.0.0');
        const descriptor = createDescriptor(seed);
        const environmentArtifact = createEnvironmentArtifact({
            descriptor,
            resolvedEnvironment: resolveTemplateEnvironment(descriptor),
        });
        const snapshotArtifact = createSnapshotArtifact({
            snapshot: buildRuntimeSnapshotFromArtifact(environmentArtifact),
        });
        const exported = await exportArtifact({
            artifact: environmentArtifact,
            format: ArtifactExportKinds.JSON,
            options: { download: false },
        });

        const verification = await verifyExportArtifact({
            artifact: snapshotArtifact,
            format: exported.format,
            output: exported.output,
            exportHash: exported.exportHash,
            simulationTraceFingerprint: exported.simulationTraceFingerprint,
            canonicalVersion: exported.canonicalVersion,
            algorithm: exported.algorithm,
            options: { download: false },
        });

        assert.equal(verification.valid, true);
        assert.equal(verification.exportHash, exported.exportHash);
    }));

test('verifyExportArtifact rejects mismatched export hashes', async () =>
    withTempRegistry(async () => {
        const seed = registerPublishedSeed('1.0.0');
        const descriptor = createDescriptor(seed);
        const artifact = createEnvironmentArtifact({
            descriptor,
            resolvedEnvironment: resolveTemplateEnvironment(descriptor),
        });
        const exported = await exportArtifact({
            artifact,
            format: ArtifactExportKinds.JSON,
            options: { download: false },
        });

        const verification = await verifyExportArtifact({
            artifact,
            format: exported.format,
            output: exported.output,
            exportHash: `${exported.exportHash.slice(0, -1)}0`,
            simulationTraceFingerprint: exported.simulationTraceFingerprint,
            canonicalVersion: exported.canonicalVersion,
            algorithm: exported.algorithm,
            options: { download: false },
        });

        assert.equal(verification.valid, false);
        assert.equal(verification.hashMatches, false);
    }));

test('verifyExportArtifact rejects tampered simulation trace fingerprint', async () => {
    const runtimeSnapshot = {
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
    };
    const artifact = createSnapshotArtifact({ snapshot: runtimeSnapshot });
    const exported = await exportArtifact({
        artifact,
        format: ArtifactExportKinds.JSON,
        options: { download: false },
    });

    const verification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        simulationTraceFingerprint: `${exported.simulationTraceFingerprint.slice(0, -1)}0`,
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: { download: false, requireSimulationTraceFingerprint: true },
    });

    assert.equal(verification.valid, false);
    assert.equal(verification.traceFingerprintMatches, false);
});

test('verifyExportArtifact rejects missing simulation trace fingerprint when required', async () => {
    const runtimeSnapshot = {
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
    };
    const artifact = createSnapshotArtifact({ snapshot: runtimeSnapshot });
    const exported = await exportArtifact({
        artifact,
        format: ArtifactExportKinds.JSON,
        options: { download: false },
    });

    const verification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: { download: false, requireSimulationTraceFingerprint: true },
    });

    assert.equal(verification.valid, false);
    assert.equal(verification.traceFingerprintRequired, true);
    assert.equal(verification.traceFingerprintProvided, false);
});

test('verifyExportArtifact succeeds with strict trace + primitive lineage requirements', async () => {
    const runtimeSnapshot = {
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
    };
    const artifact = createSnapshotArtifact({ snapshot: runtimeSnapshot });
    const exported = await exportArtifact({
        artifact,
        format: ArtifactExportKinds.JSON,
        options: { download: false },
    });

    const verification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        simulationTraceFingerprint: exported.simulationTraceFingerprint,
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: {
            download: false,
            requireSimulationTraceFingerprint: true,
            requireSimulationPrimitiveTraceLineage: true,
        },
    });

    assert.equal(verification.valid, true);
    assert.equal(verification.traceFingerprintMatches, true);
    assert.equal(verification.primitiveTraceLineageProvided, true);
});

test('verifyExportArtifact rejects missing primitive simulation trace lineage when required', async () => {
    const runtimeSnapshot = {
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
                        },
                    ],
                },
            },
        },
    };
    const artifact = createSnapshotArtifact({ snapshot: runtimeSnapshot });
    const exported = await exportArtifact({
        artifact,
        format: ArtifactExportKinds.JSON,
        options: { download: false },
    });

    const verification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        simulationTraceFingerprint: exported.simulationTraceFingerprint,
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: {
            download: false,
            requireSimulationTraceFingerprint: true,
            requireSimulationPrimitiveTraceLineage: true,
        },
    });

    assert.equal(verification.valid, false);
    assert.equal(verification.primitiveTraceLineageRequired, true);
    assert.equal(verification.primitiveTraceLineageProvided, false);
});

test('verifyExportArtifact validates federation audit attestation when provided', async () => {
    const runtimeSnapshot = {
        document: createDocument(),
        runtime: {
            federationAudit: {
                entries: [
                    { type: 'runtime.federation.audit', sessionId: 'fed-a', status: 'accepted' },
                    { type: 'runtime.federation.audit', sessionId: 'fed-a', status: 'closed' },
                ],
                hash: 'fed-hash-a',
                maxEntries: 256,
            },
        },
    };
    const artifact = createSnapshotArtifact({ snapshot: runtimeSnapshot });
    const exported = await exportArtifact({
        artifact,
        format: ArtifactExportKinds.JSON,
        options: { download: false },
    });

    const verification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        federationAuditAttestation: exported.federationAuditAttestation,
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: { download: false },
    });

    assert.equal(verification.valid, true);
    assert.equal(verification.federationAuditAttestationProvided, true);
    assert.equal(verification.federationAuditAttestationMatches, true);
});

test('verifyExportArtifact rejects tampered federation audit attestation when required', async () => {
    const runtimeSnapshot = {
        document: createDocument(),
        runtime: {
            federationAudit: {
                entries: [{ type: 'runtime.federation.audit', sessionId: 'fed-a', status: 'accepted' }],
                hash: 'fed-hash-a',
                maxEntries: 256,
            },
        },
    };
    const artifact = createSnapshotArtifact({ snapshot: runtimeSnapshot });
    const exported = await exportArtifact({
        artifact,
        format: ArtifactExportKinds.JSON,
        options: { download: false },
    });

    const verification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        federationAuditAttestation: {
            hash: `${exported.federationAuditAttestation.hash.slice(0, -1)}0`,
            entryCount: exported.federationAuditAttestation.entryCount,
        },
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: { download: false, requireFederationAuditAttestation: true },
    });

    assert.equal(verification.valid, false);
    assert.equal(verification.federationAuditAttestationRequired, true);
    assert.equal(verification.federationAuditAttestationMatches, false);
});

test('verifyExportArtifact fails closed when federation audit attestation is required but missing', async () => {
    const runtimeSnapshot = {
        document: createDocument(),
        runtime: {
            federationAudit: {
                entries: [{ type: 'runtime.federation.audit', sessionId: 'fed-a', status: 'accepted' }],
                hash: 'fed-hash-a',
                maxEntries: 256,
            },
        },
    };
    const artifact = createSnapshotArtifact({ snapshot: runtimeSnapshot });
    const exported = await exportArtifact({
        artifact,
        format: ArtifactExportKinds.JSON,
        options: { download: false },
    });

    const verification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: { download: false, requireFederationAuditAttestation: true },
    });

    assert.equal(verification.valid, false);
    assert.equal(verification.federationAuditAttestationRequired, true);
    assert.equal(verification.federationAuditAttestationProvided, false);
});
