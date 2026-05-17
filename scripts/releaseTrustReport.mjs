import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hashRuntimeState } from '../core/persistence/hashDocument.js';
import {
    ArtifactExportKinds,
    createSnapshotArtifact,
    exportArtifact,
} from '../runtime/export/exportArtifact.js';
import { verifyExportArtifact } from '../runtime/export/verify/verifyExportArtifact.js';

const REPORT_SCHEMA_VERSION = '1.0.0';
const REPORT_PATH = path.join(process.cwd(), '.artifacts', 'release-trust.json');

function createReleaseSnapshot() {
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
        runtime: {
            federationAudit: {
                entries: [{ type: 'runtime.federation.audit', sessionId: 'release-report', status: 'accepted' }],
                hash: 'release-report-fed-hash',
                maxEntries: 256,
            },
            simulation: {
                trace: {
                    entries: [
                        {
                            tickTime: 16,
                            deltaTime: 16,
                            simulationHash: 'sim-hash-a',
                            entityCount: 1,
                            constraintLayerSignature: 'layer-a',
                            primitiveTrace: [{ type: 'entity.spring-step', entityId: 'root', spring: 24, damping: 9 }],
                        },
                    ],
                },
            },
        },
    };
}

function runArchitectureGateStatus() {
    const outcome = spawnSync('node', ['enforceDroppleLaws.cjs'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf8',
    });
    return Object.freeze({
        ok: outcome.status === 0,
        exitCode: Number.isInteger(outcome.status) ? outcome.status : 1,
    });
}

function writeReport(report, reportPath = REPORT_PATH) {
    const directory = path.dirname(reportPath);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

export async function generateReleaseTrustReport({ write = true } = {}) {
    const artifact = createSnapshotArtifact({
        snapshot: createReleaseSnapshot(),
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

    const strictVerification = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        simulationTraceFingerprint: exported.simulationTraceFingerprint,
        federationAuditAttestation: exported.federationAuditAttestation,
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: {
            download: false,
            requireSimulationTraceFingerprint: true,
            requireSimulationPrimitiveTraceLineage: true,
            requireFederationAuditAttestation: true,
        },
    });

    const tamperedFederation = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        simulationTraceFingerprint: exported.simulationTraceFingerprint,
        federationAuditAttestation: {
            hash: 'tampered-fed-hash',
            entryCount: 999,
        },
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: {
            download: false,
            requireFederationAuditAttestation: true,
        },
    });

    const tamperedSimulation = await verifyExportArtifact({
        artifact,
        format: exported.format,
        output: exported.output,
        exportHash: exported.exportHash,
        simulationTraceFingerprint: 'tampered-simulation-fingerprint',
        federationAuditAttestation: exported.federationAuditAttestation,
        canonicalVersion: exported.canonicalVersion,
        algorithm: exported.algorithm,
        options: {
            download: false,
            requireSimulationTraceFingerprint: true,
        },
    });

    const architectureGate = runArchitectureGateStatus();

    const checks = Object.freeze({
        architectureGate: Object.freeze({
            ok: architectureGate.ok,
            exitCode: architectureGate.exitCode,
        }),
        exportVerification: Object.freeze({
            ok: strictVerification.valid === true,
            exportHash: exported.exportHash,
            canonicalVersion: exported.canonicalVersion,
            algorithm: exported.algorithm,
        }),
        federationAttestation: Object.freeze({
            ok:
                strictVerification.federationAuditAttestationProvided === true &&
                strictVerification.federationAuditAttestationMatches === true &&
                tamperedFederation.valid === false,
            hash: exported.federationAuditAttestation?.hash ?? null,
            entryCount: Number.isFinite(exported.federationAuditAttestation?.entryCount)
                ? Number(exported.federationAuditAttestation.entryCount)
                : 0,
            tamperRejected: tamperedFederation.valid === false,
        }),
        simulationTrace: Object.freeze({
            ok:
                strictVerification.traceFingerprintProvided === true &&
                strictVerification.traceFingerprintMatches === true &&
                strictVerification.primitiveTraceLineageProvided === true &&
                tamperedSimulation.valid === false,
            fingerprint: exported.simulationTraceFingerprint,
            primitiveTraceLineageProvided: strictVerification.primitiveTraceLineageProvided === true,
            tamperRejected: tamperedSimulation.valid === false,
        }),
    });

    const overallOk = Object.values(checks).every((check) => check.ok === true);
    const reportPayload = Object.freeze({
        schemaVersion: REPORT_SCHEMA_VERSION,
        overallOk,
        checks,
    });

    const report = Object.freeze({
        ...reportPayload,
        reportHash: hashRuntimeState(reportPayload),
    });

    if (write) {
        writeReport(report);
    }

    return report;
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isEntrypoint) {
    const report = await generateReleaseTrustReport({ write: true });
    if (!report.overallOk) {
        console.error('[ReleaseTrustReport] FAIL');
        process.exit(1);
    }
    console.log('[ReleaseTrustReport] OK');
    console.log(`[ReleaseTrustReport] reportHash: ${report.reportHash}`);
}
