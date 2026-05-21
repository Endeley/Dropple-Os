export function createReleaseTrustReportFixture({
    runtimeProbeDurationMs = 1300,
    reportHash = 'report-hash-a',
} = {}) {
    return {
        schemaVersion: '1.0.0',
        overallOk: true,
        checks: {
            architectureGate: { ok: true, exitCode: 0 },
            exportVerification: { ok: true, exportHash: 'a', canonicalVersion: 'v1', algorithm: 'sha-256' },
            federationAttestation: { ok: true, tamperRejected: true, hash: 'h', entryCount: 1 },
            federationLifecycle: { ok: true, replayEquivalent: true, staleRejected: true, orderingClosed: true },
            simulationTrace: { ok: true, fingerprint: 'f', primitiveTraceLineageProvided: true, tamperRejected: true },
            osSurfaceIntentRouting: {
                ok: true,
                mutationFree: true,
                acceptedCount: 1,
                rejectedCount: 1,
                allowlistPolicyVersion: '1',
                allowlistActionCount: 4,
                allowlistActionHash: 'hash-a',
            },
            osSurfaceShellContract: {
                ok: true,
                policyVersion: '1',
                policyHash: 'policy-hash-a',
                matrixOk: true,
                projectionShapeOk: true,
                projectionDeterministic: true,
                projectionKeyHash: 'projection-hash-a',
            },
            osSurfaceWorkspaceIdentity: {
                ok: true,
                workspaceId: 'design',
                modeId: 'graphic',
                overlaysCount: 2,
                overlaysHash: 'overlays-hash-a',
            },
            osSurfaceActivationProvenance: {
                ok: true,
                tuplesDeterministic: true,
                sampleCount: 6,
                tuplesHash: 'tuples-hash-a',
                sourceHash: 'source-hash-a',
                overlayHash: 'overlay-hash-a',
            },
            osSurfaceShellClickability: {
                ok: true,
                helperPresent: true,
                publishGuarded: true,
                addKeyframeGuarded: true,
                trialGuardCount: 1,
            },
            osSurfaceShellRuntimeProbe: {
                ok: true,
                skipped: false,
                required: false,
                reason: null,
                publishClickable: true,
                keyframeClickable: true,
                interceptErrors: 0,
                durationMs: runtimeProbeDurationMs,
            },
        },
        reportHash,
    };
}

export function createReleaseTrustProbeFixture({
    report,
    generatedAt = '2026-05-21T00:00:00.000Z',
} = {}) {
    return {
        generatedAt,
        check: report?.checks?.osSurfaceShellRuntimeProbe ?? {
            ok: true,
            skipped: false,
            required: false,
            reason: null,
            publishClickable: true,
            keyframeClickable: true,
            interceptErrors: 0,
            durationMs: 1300,
        },
    };
}

export function createReleaseTrustProbeBaselineFixture({
    durationMs = 1200,
    generatedAt = '2026-05-20T00:00:00.000Z',
} = {}) {
    return {
        generatedAt,
        check: { durationMs },
    };
}
