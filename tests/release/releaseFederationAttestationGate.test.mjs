import test from 'node:test';
import assert from 'node:assert/strict';
import { ArtifactExportKinds, createSnapshotArtifact, exportArtifact } from '@/runtime/export/exportArtifact.js';
import { verifyExportArtifact } from '@/runtime/export/verify/verifyExportArtifact.js';

function createSnapshot({ withFederationAudit = true } = {}) {
    return {
        document: {
            sceneGraph: {
                rootIds: ['root'],
                nodes: {
                    root: { id: 'root', type: 'frame', children: [] },
                },
                activeSceneId: 'sceneA',
                scenes: [{ id: 'sceneA', shots: [{ id: 'shotA', start: 0, duration: 1000, compositionId: 'root' }] }],
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
        runtime: withFederationAudit
            ? {
                federationAudit: {
                    entries: [{ type: 'runtime.federation.audit', sessionId: 'release-gate', status: 'accepted' }],
                    hash: 'release-gate-fed-hash',
                    maxEntries: 256,
                },
            }
            : {},
    };
}

test('release export verification fails closed when federation attestation is missing', async () => {
    const artifact = createSnapshotArtifact({
        snapshot: createSnapshot({ withFederationAudit: false }),
    });

    await assert.rejects(
        () =>
            exportArtifact({
                artifact,
                format: ArtifactExportKinds.JSON,
                options: {
                    download: false,
                    verification: {
                        enabled: true,
                        profile: 'release',
                    },
                },
            }),
        /Export attestation failed/,
    );
});

test('release export verification fails closed when federation attestation is tampered', async () => {
    const artifact = createSnapshotArtifact({
        snapshot: createSnapshot({ withFederationAudit: true }),
    });
    const exported = await exportArtifact({
        artifact,
        format: ArtifactExportKinds.JSON,
        options: {
            download: false,
            verification: {
                enabled: true,
                profile: 'release',
            },
        },
    });

    const verification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        simulationTraceFingerprint: exported.simulationTraceFingerprint,
        federationAuditAttestation: {
            hash: 'tampered-hash',
            entryCount: 999,
        },
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: {
            download: false,
            requireFederationAuditAttestation: true,
        },
    });

    assert.equal(verification.valid, false);
    assert.equal(verification.federationAuditAttestationMatches, false);
});
