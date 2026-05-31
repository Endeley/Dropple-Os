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
import { replayEvents } from '../runtime/dispatcher/replayEvents.js';
import { createEventDispatcher } from '../runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '../runtime/state/runtimeState.internal.js';
import { installBlueprint, certifyBlueprint } from '../runtime/blueprints/installBlueprint.js';
import { createBlueprintInstallManifest } from '../runtime/blueprints/createBlueprintInstallManifest.js';
import { EventTypes } from '../core/events/eventTypes.js';
import {
    beginFederationSessionAction,
    closeFederationSessionAction,
    commitFederationSessionAction,
    updateFederationPreviewAction,
} from '../runtime/orchestration/sessionFederationActions.js';
import { evaluateSurfaceIntentRoutingContract } from '../runtime/osSurface/validateSurfaceIntentRouting.js';
import {
    OS_WORKSPACE_SHELL_ALLOWED_ACTIONS,
    OS_WORKSPACE_SHELL_ACTION_POLICY_VERSION,
} from '../runtime/osSurface/shellActionPolicy.js';
import { buildWorkspaceShellSurfaceModel } from '../runtime/osSurface/buildWorkspaceShellSurfaceModel.js';
import {
    resolveCanonicalWorkspaceOverlayContext,
    resolveWorkspaceContext,
} from '../platform/workspaces/index.js';
import { runOsSurfaceClickabilityProbe } from './releaseTrustChecks/osSurfaceClickabilityProbe.mjs';

const REPORT_SCHEMA_VERSION = '1.0.0';
const REPORT_PATH = path.join(process.cwd(), '.artifacts', 'release-trust.json');
const OS_SURFACE_CLICKABILITY_PROBE_PATH = path.join(
    process.cwd(),
    '.artifacts',
    'os-surface-clickability-probe.json',
);
const UIUX_TEMPLATE_GENERATION_SPEC_PATH = path.join(
    process.cwd(),
    'tests',
    'e2e',
    'uiux-template-generation.spec.js',
);

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
    const outcome = spawnSync('npm', ['run', 'architecture:ci'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf8',
    });
    const error = outcome.error ? String(outcome.error.message ?? outcome.error) : null;
    const stdout = typeof outcome.stdout === 'string' ? outcome.stdout.trim() : '';
    const stderr = typeof outcome.stderr === 'string' ? outcome.stderr.trim() : '';
    return Object.freeze({
        ok: outcome.status === 0,
        exitCode: Number.isInteger(outcome.status) ? outcome.status : 1,
        error,
        stdoutTail: stdout ? stdout.split('\n').slice(-12).join('\n') : null,
        stderrTail: stderr ? stderr.split('\n').slice(-12).join('\n') : null,
    });
}

function writeReport(report, reportPath = REPORT_PATH) {
    const directory = path.dirname(reportPath);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function writeProbeArtifact(probePayload, probePath = OS_SURFACE_CLICKABILITY_PROBE_PATH) {
    const directory = path.dirname(probePath);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(probePath, `${JSON.stringify(probePayload, null, 2)}\n`, 'utf8');
}

function getSession(state, sessionId) {
    return state?.collaboration?.federation?.sessions?.[sessionId] ?? null;
}

function evaluateFederationLifecycleGate() {
    const sessionId = 'release:trust:federation';
    const begin = beginFederationSessionAction({
        sessionId,
        participants: ['peer-z', 'peer-a'],
        authority: { ownerId: 'release-trust', mode: 'coordination-only' },
    });
    let uninterrupted = replayEvents({ initialState: undefined, events: [begin] });
    const started = getSession(uninterrupted, sessionId);
    const preview = updateFederationPreviewAction({
        sessionId,
        bounds: { x: 4, y: 5, width: 6, height: 7 },
        expectedCheckpointSignature: started?.checkpoint?.checkpointSignature ?? null,
    });
    uninterrupted = replayEvents({ initialState: uninterrupted, events: [preview] });
    const afterPreview = getSession(uninterrupted, sessionId);
    const commit = commitFederationSessionAction({
        sessionId,
        expectedCheckpointSignature: afterPreview?.checkpoint?.checkpointSignature ?? null,
    });
    uninterrupted = replayEvents({ initialState: uninterrupted, events: [commit] });
    const afterCommit = getSession(uninterrupted, sessionId);
    const close = closeFederationSessionAction({
        sessionId,
        expectedCheckpointSignature: afterCommit?.checkpoint?.checkpointSignature ?? null,
    });
    uninterrupted = replayEvents({ initialState: uninterrupted, events: [close] });

    let resumed = replayEvents({ initialState: undefined, events: [begin] });
    resumed = replayEvents({ initialState: resumed, events: [preview] });
    resumed = replayEvents({ initialState: resumed, events: [commit] });
    resumed = replayEvents({ initialState: resumed, events: [close] });

    let staleRejected = false;
    try {
        replayEvents({
            initialState: replayEvents({ initialState: undefined, events: [begin] }),
            events: [
                commitFederationSessionAction({
                    sessionId,
                    expectedCheckpointSignature: 'stale-signature',
                }),
            ],
        });
    } catch (error) {
        staleRejected = /"reason":"STALE_FEDERATION_EVENT"/.test(String(error?.message ?? ''));
    }

    return Object.freeze({
        ok: staleRejected && JSON.stringify(resumed) === JSON.stringify(uninterrupted) && getSession(uninterrupted, sessionId) === null,
        staleRejected,
        replayEquivalent: JSON.stringify(resumed) === JSON.stringify(uninterrupted),
        orderingClosed: getSession(uninterrupted, sessionId) === null,
    });
}

function evaluateOsSurfaceShellClickabilityGate() {
    if (!fs.existsSync(UIUX_TEMPLATE_GENERATION_SPEC_PATH)) {
        return Object.freeze({
            ok: false,
            helperPresent: false,
            publishGuarded: false,
            addKeyframeGuarded: false,
            trialGuardCount: 0,
        });
    }
    const source = fs.readFileSync(UIUX_TEMPLATE_GENERATION_SPEC_PATH, 'utf8');
    const helperPresent = /async function assertReceivesPointerEvents\s*\(/.test(source);
    const publishGuarded =
        /const publishButton = page\.getByRole\('button',\s*\{\s*name:\s*'Publish'\s*\}\);/.test(source) &&
        /await assertReceivesPointerEvents\(publishButton\);/.test(source);
    const addKeyframeGuarded =
        /const addKeyframeButton = page\.getByTestId\('uiux-transition-add-keyframe'\);/.test(source) &&
        /await assertReceivesPointerEvents\(addKeyframeButton\);/.test(source);
    const trialGuardCount = Array.from(source.matchAll(/click\(\{\s*trial:\s*true\s*\}\)/g)).length;

    return Object.freeze({
        ok: helperPresent && publishGuarded && addKeyframeGuarded && trialGuardCount >= 1,
        helperPresent,
        publishGuarded,
        addKeyframeGuarded,
        trialGuardCount,
    });
}

function parseEnvBoolean(value, fallback = false) {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
    return fallback;
}

function evaluateOsSurfaceShellRuntimeProbeGate() {
    const shouldProbe = parseEnvBoolean(process.env.RELEASE_TRUST_UI_PROBE, true);
    const required = parseEnvBoolean(process.env.CI, false) || parseEnvBoolean(process.env.RELEASE_TRUST_REQUIRE_UI_PROBE, false);

    if (!shouldProbe) {
        return Object.freeze({
            ok: required ? false : true,
            skipped: true,
            required,
            reason: required ? 'probe-required-but-disabled' : 'probe-disabled-by-env',
            publishClickable: required ? false : true,
            keyframeClickable: required ? false : true,
            interceptErrors: 0,
            durationMs: 0,
            failedTestTitle: null,
            traceHint: null,
            stdoutTail: null,
            stderrTail: null,
        });
    }

    const result = runOsSurfaceClickabilityProbe();
    return Object.freeze({
        ok: result.ok === true,
        skipped: false,
        required,
        reason: typeof result.reason === 'string' ? result.reason : null,
        publishClickable: result.publishClickable === true,
        keyframeClickable: result.keyframeClickable === true,
        interceptErrors: Number.isFinite(result.interceptErrors) ? Number(result.interceptErrors) : 0,
        durationMs: Number.isFinite(result.durationMs) && Number(result.durationMs) >= 0 ? Number(result.durationMs) : 0,
        failedTestTitle: typeof result.failedTestTitle === 'string' ? result.failedTestTitle : null,
        traceHint: typeof result.traceHint === 'string' ? result.traceHint : null,
        stdoutTail: typeof result.stdoutTail === 'string' ? result.stdoutTail : null,
        stderrTail: typeof result.stderrTail === 'string' ? result.stderrTail : null,
    });
}

function evaluateOsSurfaceShellContractGate(osSurfaceIntentRouting) {
    const policyHash = hashRuntimeState(OS_WORKSPACE_SHELL_ALLOWED_ACTIONS);
    const sample = buildWorkspaceShellSurfaceModel({
        environment: {
            workspaceId: 'design',
            modeId: 'graphic',
            activeEnvironmentId: 'env-a',
            activeSessionId: 'session-a',
            capabilityOverlays: ['conversion', 'ai', 'conversion'],
            federation: {
                participantIds: ['peer-z', 'peer-a', 'peer-z'],
                sessionPhase: 'preview',
            },
            trustEnvelope: {
                releaseTrustHash: 'trust-a',
            },
        },
        synthesizedTools: {
            activeToolId: 'select',
            tools: [{ toolId: 'move' }, { toolId: 'select' }, { toolId: 'move' }],
        },
        assistants: {
            perspectiveId: 'build',
            activeAssistantId: 'assistant.build',
            assistantIds: ['assistant.build'],
        },
    });
    const expectedKeys = [
        'workspaceId',
        'modeId',
        'environmentId',
        'sessionId',
        'overlays',
        'participantIds',
        'federationPhase',
        'releaseTrustHash',
        'perspectiveId',
        'activeAssistantId',
        'visibleAssistantIds',
        'activeToolId',
        'visibleToolIds',
    ];
    const sampleKeys = Object.keys(sample);
    const projectionShapeOk = JSON.stringify(sampleKeys) === JSON.stringify(expectedKeys);
    const sampleRoundtrip = buildWorkspaceShellSurfaceModel({
        environment: {
            workspaceId: 'design',
            modeId: 'graphic',
            activeEnvironmentId: 'env-a',
            activeSessionId: 'session-a',
            capabilityOverlays: ['ai', 'conversion'],
            federation: {
                participantIds: ['peer-a', 'peer-z'],
                sessionPhase: 'preview',
            },
            trustEnvelope: {
                releaseTrustHash: 'trust-a',
            },
        },
        synthesizedTools: {
            activeToolId: 'select',
            tools: [{ toolId: 'select' }, { toolId: 'move' }],
        },
        assistants: {
            perspectiveId: 'build',
            activeAssistantId: 'assistant.build',
            assistantIds: ['assistant.build'],
        },
    });
    const projectionDeterministic = JSON.stringify(sample) === JSON.stringify(sampleRoundtrip);
    const projectionKeyHash = hashRuntimeState(sampleKeys);

    return Object.freeze({
        ok:
            OS_WORKSPACE_SHELL_ACTION_POLICY_VERSION === '1' &&
            policyHash.length > 0 &&
            osSurfaceIntentRouting?.ok === true &&
            osSurfaceIntentRouting?.mutationFree === true &&
            projectionShapeOk &&
            projectionDeterministic,
        policyVersion: OS_WORKSPACE_SHELL_ACTION_POLICY_VERSION,
        policyHash,
        matrixOk: osSurfaceIntentRouting?.ok === true && osSurfaceIntentRouting?.mutationFree === true,
        projectionShapeOk,
        projectionDeterministic,
        projectionKeyHash,
    });
}

function evaluateOsSurfaceActivationProvenanceGate() {
    const samples = Object.freeze([
        Object.freeze({ workspaceId: 'design', modeId: 'graphic' }),
        Object.freeze({ workspace: 'uiux' }),
        Object.freeze({ workspace: 'media', mode: 'podcast' }),
        Object.freeze({ workspace: 'build', mode: 'conversion' }),
        Object.freeze({ workspace: 'system', mode: 'versioning' }),
        Object.freeze({ workspace: 'unknown-workspace' }),
    ]);

    const project = (entry) => {
        const canonical = resolveWorkspaceContext(entry);
        const overlay = resolveCanonicalWorkspaceOverlayContext(entry);
        return Object.freeze({
            inputWorkspace: String(entry.workspaceId ?? entry.workspace ?? ''),
            inputMode: String(entry.modeId ?? entry.mode ?? ''),
            workspaceId: String(canonical.workspaceId ?? ''),
            modeId: String(canonical.modeId ?? ''),
            source: String(canonical.source ?? ''),
            overlayId: String(overlay.overlayId ?? ''),
            canonicalModeId: String(overlay.canonicalModeId ?? ''),
        });
    };

    const tuples = Object.freeze(samples.map(project));
    const replayTuples = Object.freeze(samples.map((entry) => project({ ...entry })));

    const tuplesDeterministic = JSON.stringify(tuples) === JSON.stringify(replayTuples);
    const tuplesHash = hashRuntimeState(tuples);
    const sourceHash = hashRuntimeState(tuples.map((entry) => entry.source));
    const overlayHash = hashRuntimeState(
        tuples
            .map((entry) => entry.overlayId)
            .filter((value) => typeof value === 'string' && value.length > 0),
    );
    const samplesValid = tuples.every(
        (entry) =>
            typeof entry.workspaceId === 'string' &&
            entry.workspaceId.length > 0 &&
            typeof entry.modeId === 'string' &&
            entry.modeId.length > 0 &&
            typeof entry.source === 'string' &&
            entry.source.length > 0,
    );

    return Object.freeze({
        ok: tuplesDeterministic && samplesValid && tuples.length === samples.length,
        tuplesDeterministic,
        sampleCount: tuples.length,
        tuplesHash,
        sourceHash,
        overlayHash,
    });
}

async function evaluateBlueprintBootstrapProvenanceGate() {
    const blueprint = certifyBlueprint({
        id: 'bp.release.bootstrap.v1',
        version: 1,
        name: 'Release Bootstrap Blueprint',
        description: 'release trust bootstrap provenance fixture',
        kind: 'project',
        workspaceProfiles: { create: ['uiux'] },
        capabilityProfiles: { create: ['node:create'] },
        seedGraph: { nodes: {}, rootIds: [] },
        seedEvents: [
            {
                type: EventTypes.NODE_CREATE,
                payload: {
                    node: {
                        id: 'bootstrap.frame',
                        type: 'frame',
                    },
                },
            },
        ],
        workflowPresets: {},
        publishPresets: {},
        lineage: {
            rootId: 'bp.release.bootstrap.root',
            versionId: 'bp.release.bootstrap.v1',
            parentVersionId: null,
        },
    });

    const manifestA = createBlueprintInstallManifest({
        projectId: 'project.release.bootstrap',
        projectName: 'Release Bootstrap Project',
        defaultPerspectiveId: 'create',
        blueprint,
    });
    const manifestB = createBlueprintInstallManifest({
        projectId: 'project.release.bootstrap',
        projectName: 'Release Bootstrap Project',
        defaultPerspectiveId: 'create',
        blueprint,
    });

    const dispatcherA = createEventDispatcher({ headless: true });
    const dispatcherB = createEventDispatcher({ headless: true });
    dispatcherA.hydrateRuntimeState(initialRuntimeState, { animate: false });
    dispatcherB.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await installBlueprint({ dispatcher: dispatcherA, blueprint, manifest: manifestA });
    await installBlueprint({ dispatcher: dispatcherB, blueprint, manifest: manifestB });

    const stateA = dispatcherA.getState();
    const stateB = dispatcherB.getState();
    const persistedA = stateA?.document?.meta?.projectBootstrap ?? null;
    const persistedB = stateB?.document?.meta?.projectBootstrap ?? null;
    const deterministicManifest = JSON.stringify(manifestA) === JSON.stringify(manifestB);
    const replayEquivalent = hashRuntimeState(stateA?.document ?? {}) === hashRuntimeState(stateB?.document ?? {});
    const bootstrapEventPersisted = stateA?.events?.[0]?.type === EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP;

    const persisted = Boolean(
        persistedA &&
            persistedA.projectId === manifestA.projectId &&
            persistedA.projectName === manifestA.projectName &&
            persistedA.defaultPerspectiveId === manifestA.defaultPerspectiveId &&
            persistedA.blueprintId === manifestA.blueprintId &&
            persistedA.blueprintVersionId === manifestA.blueprintVersionId,
    );

    const perspectiveRoutable = ['overview', 'create', 'build', 'operate', 'collaborate', 'publish'].includes(
        String(persistedA?.defaultPerspectiveId ?? ''),
    );

    return Object.freeze({
        ok: deterministicManifest && persisted && replayEquivalent && bootstrapEventPersisted && perspectiveRoutable,
        deterministicManifest,
        persisted,
        replayEquivalent,
        bootstrapEventPersisted,
        perspectiveRoutable,
        defaultPerspectiveId: String(persistedA?.defaultPerspectiveId ?? ''),
        blueprintId: String(persistedA?.blueprintId ?? ''),
        blueprintVersionId: String(persistedA?.blueprintVersionId ?? ''),
        projectIdHash: hashRuntimeState(String(persistedA?.projectId ?? '')),
        replayParityHash: hashRuntimeState({
            a: persistedA,
            b: persistedB,
        }),
    });
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
    const federationLifecycle = evaluateFederationLifecycleGate();
    const osSurfaceIntentRouting = evaluateSurfaceIntentRoutingContract();
    const osSurfaceShellContract = evaluateOsSurfaceShellContractGate(osSurfaceIntentRouting);
    const osSurfaceActivationProvenance = evaluateOsSurfaceActivationProvenanceGate();
    const osSurfaceShellClickability = evaluateOsSurfaceShellClickabilityGate();
    const osSurfaceShellRuntimeProbe = evaluateOsSurfaceShellRuntimeProbeGate();
    const blueprintBootstrapProvenance = await evaluateBlueprintBootstrapProvenanceGate();
    const workspaceIdentityModel = buildWorkspaceShellSurfaceModel({
        environment: {
            workspaceId: 'design',
            modeId: 'graphic',
            activeEnvironmentId: 'env-a',
            activeSessionId: 'session-a',
            capabilityOverlays: ['conversion', 'ai', 'conversion'],
            federation: {
                participantIds: ['peer-z', 'peer-a', 'peer-z'],
                sessionPhase: 'preview',
            },
            trustEnvelope: {
                releaseTrustHash: 'trust-a',
            },
        },
        synthesizedTools: {
            activeToolId: 'select',
            tools: [{ toolId: 'move' }, { toolId: 'select' }, { toolId: 'move' }],
        },
    });
    const overlaysHash = hashRuntimeState(workspaceIdentityModel.overlays ?? []);

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
        federationLifecycle: Object.freeze({
            ok:
                federationLifecycle.staleRejected === true &&
                federationLifecycle.replayEquivalent === true &&
                federationLifecycle.orderingClosed === true,
            staleRejected: federationLifecycle.staleRejected === true,
            replayEquivalent: federationLifecycle.replayEquivalent === true,
            orderingClosed: federationLifecycle.orderingClosed === true,
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
        osSurfaceIntentRouting: Object.freeze({
            ok: osSurfaceIntentRouting.ok === true,
            mutationFree: osSurfaceIntentRouting.mutationFree === true,
            acceptedCount: Number.isFinite(osSurfaceIntentRouting.acceptedCount)
                ? Number(osSurfaceIntentRouting.acceptedCount)
                : 0,
            rejectedCount: Number.isFinite(osSurfaceIntentRouting.rejectedCount)
                ? Number(osSurfaceIntentRouting.rejectedCount)
                : 0,
            allowlistPolicyVersion: OS_WORKSPACE_SHELL_ACTION_POLICY_VERSION,
            allowlistActionCount: OS_WORKSPACE_SHELL_ALLOWED_ACTIONS.length,
            allowlistActionHash: hashRuntimeState(OS_WORKSPACE_SHELL_ALLOWED_ACTIONS),
        }),
        osSurfaceShellContract: Object.freeze({
            ok: osSurfaceShellContract.ok === true,
            policyVersion: String(osSurfaceShellContract.policyVersion ?? ''),
            policyHash: String(osSurfaceShellContract.policyHash ?? ''),
            matrixOk: osSurfaceShellContract.matrixOk === true,
            projectionShapeOk: osSurfaceShellContract.projectionShapeOk === true,
            projectionDeterministic: osSurfaceShellContract.projectionDeterministic === true,
            projectionKeyHash: String(osSurfaceShellContract.projectionKeyHash ?? ''),
        }),
        osSurfaceWorkspaceIdentity: Object.freeze({
            ok:
                typeof workspaceIdentityModel.workspaceId === 'string' &&
                workspaceIdentityModel.workspaceId.length > 0 &&
                typeof workspaceIdentityModel.modeId === 'string' &&
                workspaceIdentityModel.modeId.length > 0 &&
                Array.isArray(workspaceIdentityModel.overlays),
            workspaceId: String(workspaceIdentityModel.workspaceId ?? ''),
            modeId: String(workspaceIdentityModel.modeId ?? ''),
            overlaysCount: Array.isArray(workspaceIdentityModel.overlays)
                ? workspaceIdentityModel.overlays.length
                : 0,
            overlaysHash: String(overlaysHash ?? ''),
        }),
        osSurfaceActivationProvenance: Object.freeze({
            ok: osSurfaceActivationProvenance.ok === true,
            tuplesDeterministic: osSurfaceActivationProvenance.tuplesDeterministic === true,
            sampleCount: Number.isFinite(osSurfaceActivationProvenance.sampleCount)
                ? Number(osSurfaceActivationProvenance.sampleCount)
                : 0,
            tuplesHash: String(osSurfaceActivationProvenance.tuplesHash ?? ''),
            sourceHash: String(osSurfaceActivationProvenance.sourceHash ?? ''),
            overlayHash: String(osSurfaceActivationProvenance.overlayHash ?? ''),
        }),
        osSurfaceShellClickability: Object.freeze({
            ok: osSurfaceShellClickability.ok === true,
            helperPresent: osSurfaceShellClickability.helperPresent === true,
            publishGuarded: osSurfaceShellClickability.publishGuarded === true,
            addKeyframeGuarded: osSurfaceShellClickability.addKeyframeGuarded === true,
            trialGuardCount: Number.isFinite(osSurfaceShellClickability.trialGuardCount)
                ? Number(osSurfaceShellClickability.trialGuardCount)
                : 0,
        }),
        osSurfaceShellRuntimeProbe: Object.freeze({
            ok: osSurfaceShellRuntimeProbe.ok === true,
            skipped: osSurfaceShellRuntimeProbe.skipped === true,
            required: osSurfaceShellRuntimeProbe.required === true,
            reason: typeof osSurfaceShellRuntimeProbe.reason === 'string' ? osSurfaceShellRuntimeProbe.reason : null,
            publishClickable: osSurfaceShellRuntimeProbe.publishClickable === true,
            keyframeClickable: osSurfaceShellRuntimeProbe.keyframeClickable === true,
            interceptErrors: Number.isFinite(osSurfaceShellRuntimeProbe.interceptErrors)
                ? Number(osSurfaceShellRuntimeProbe.interceptErrors)
                : 0,
            durationMs: Number.isFinite(osSurfaceShellRuntimeProbe.durationMs)
                ? Number(osSurfaceShellRuntimeProbe.durationMs)
                : 0,
            failedTestTitle: typeof osSurfaceShellRuntimeProbe.failedTestTitle === 'string'
                ? osSurfaceShellRuntimeProbe.failedTestTitle
                : null,
            traceHint: typeof osSurfaceShellRuntimeProbe.traceHint === 'string'
                ? osSurfaceShellRuntimeProbe.traceHint
                : null,
            stdoutTail: typeof osSurfaceShellRuntimeProbe.stdoutTail === 'string'
                ? osSurfaceShellRuntimeProbe.stdoutTail
                : null,
            stderrTail: typeof osSurfaceShellRuntimeProbe.stderrTail === 'string'
                ? osSurfaceShellRuntimeProbe.stderrTail
                : null,
        }),
        blueprintBootstrapProvenance: Object.freeze({
            ok: blueprintBootstrapProvenance.ok === true,
            deterministicManifest: blueprintBootstrapProvenance.deterministicManifest === true,
            persisted: blueprintBootstrapProvenance.persisted === true,
            replayEquivalent: blueprintBootstrapProvenance.replayEquivalent === true,
            bootstrapEventPersisted: blueprintBootstrapProvenance.bootstrapEventPersisted === true,
            perspectiveRoutable: blueprintBootstrapProvenance.perspectiveRoutable === true,
            defaultPerspectiveId: String(blueprintBootstrapProvenance.defaultPerspectiveId ?? ''),
            blueprintId: String(blueprintBootstrapProvenance.blueprintId ?? ''),
            blueprintVersionId: String(blueprintBootstrapProvenance.blueprintVersionId ?? ''),
            projectIdHash: String(blueprintBootstrapProvenance.projectIdHash ?? ''),
            replayParityHash: String(blueprintBootstrapProvenance.replayParityHash ?? ''),
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
        writeProbeArtifact(Object.freeze({
            generatedAt: new Date().toISOString(),
            check: checks.osSurfaceShellRuntimeProbe,
        }));
    }

    return report;
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isEntrypoint) {
    const report = await generateReleaseTrustReport({ write: true });
    if (report?.checks?.osSurfaceShellRuntimeProbe?.skipped === true) {
        console.warn(
            `[ReleaseTrustReport] WARN os surface runtime probe skipped (${report.checks.osSurfaceShellRuntimeProbe.reason ?? 'unspecified-reason'})`,
        );
    }
    if (!report.overallOk) {
        console.error('[ReleaseTrustReport] FAIL');
        for (const [checkId, check] of Object.entries(report.checks ?? {})) {
            if (check?.ok === true) continue;
            console.error(`[ReleaseTrustReport] check failed: ${checkId}`);
            console.error(`[ReleaseTrustReport] payload: ${JSON.stringify(check)}`);
        }
        console.error(`[ReleaseTrustReport] reportPath: ${REPORT_PATH}`);
        process.exit(1);
    }
    console.log('[ReleaseTrustReport] OK');
    console.log(`[ReleaseTrustReport] reportHash: ${report.reportHash}`);
}
