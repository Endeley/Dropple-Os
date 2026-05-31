import test from 'node:test';
import assert from 'node:assert/strict';
import { generateReleaseTrustReport } from '@/scripts/releaseTrustReport.mjs';

test('release trust report schema is stable and required checks are present', async () => {
    const previousProbeFlag = process.env.RELEASE_TRUST_UI_PROBE;
    process.env.RELEASE_TRUST_UI_PROBE = '0';
    const report = await generateReleaseTrustReport({ write: false });
    if (typeof previousProbeFlag === 'string') {
        process.env.RELEASE_TRUST_UI_PROBE = previousProbeFlag;
    } else {
        delete process.env.RELEASE_TRUST_UI_PROBE;
    }

    assert.equal(typeof report, 'object');
    assert.equal(report.schemaVersion, '1.0.0');
    assert.equal(typeof report.overallOk, 'boolean');
    assert.equal(typeof report.reportHash, 'string');
    assert.ok(report.reportHash.length > 0);

    assert.deepEqual(
        Object.keys(report.checks).sort((left, right) => left.localeCompare(right)),
        [
            'architectureGate',
            'blueprintBootstrapProvenance',
            'exportVerification',
            'federationAttestation',
            'federationLifecycle',
            'osSurfaceActivationProvenance',
            'osSurfaceIntentRouting',
            'osSurfaceShellClickability',
            'osSurfaceShellContract',
            'osSurfaceShellRuntimeProbe',
            'osSurfaceWorkspaceIdentity',
            'simulationTrace',
        ],
    );

    assert.equal(typeof report.checks.architectureGate.ok, 'boolean');
    assert.equal(typeof report.checks.architectureGate.exitCode, 'number');

    assert.equal(typeof report.checks.exportVerification.ok, 'boolean');
    assert.equal(typeof report.checks.exportVerification.exportHash, 'string');
    assert.equal(typeof report.checks.exportVerification.canonicalVersion, 'string');
    assert.equal(typeof report.checks.exportVerification.algorithm, 'string');

    assert.equal(typeof report.checks.federationAttestation.ok, 'boolean');
    assert.equal(typeof report.checks.federationAttestation.hash, 'string');
    assert.equal(typeof report.checks.federationAttestation.entryCount, 'number');
    assert.equal(typeof report.checks.federationAttestation.tamperRejected, 'boolean');

    assert.equal(typeof report.checks.federationLifecycle.ok, 'boolean');
    assert.equal(typeof report.checks.federationLifecycle.staleRejected, 'boolean');
    assert.equal(typeof report.checks.federationLifecycle.replayEquivalent, 'boolean');
    assert.equal(typeof report.checks.federationLifecycle.orderingClosed, 'boolean');

    assert.equal(typeof report.checks.simulationTrace.ok, 'boolean');
    assert.equal(typeof report.checks.simulationTrace.fingerprint, 'string');
    assert.equal(typeof report.checks.simulationTrace.primitiveTraceLineageProvided, 'boolean');
    assert.equal(typeof report.checks.simulationTrace.tamperRejected, 'boolean');

    assert.equal(typeof report.checks.osSurfaceIntentRouting.ok, 'boolean');
    assert.equal(typeof report.checks.osSurfaceIntentRouting.mutationFree, 'boolean');
    assert.equal(typeof report.checks.osSurfaceIntentRouting.acceptedCount, 'number');
    assert.equal(typeof report.checks.osSurfaceIntentRouting.rejectedCount, 'number');
    assert.equal(typeof report.checks.osSurfaceIntentRouting.allowlistPolicyVersion, 'string');
    assert.equal(typeof report.checks.osSurfaceIntentRouting.allowlistActionCount, 'number');
    assert.equal(typeof report.checks.osSurfaceIntentRouting.allowlistActionHash, 'string');

    assert.equal(typeof report.checks.osSurfaceShellContract.ok, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellContract.policyVersion, 'string');
    assert.equal(typeof report.checks.osSurfaceShellContract.policyHash, 'string');
    assert.equal(typeof report.checks.osSurfaceShellContract.matrixOk, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellContract.projectionShapeOk, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellContract.projectionDeterministic, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellContract.projectionKeyHash, 'string');

    assert.equal(typeof report.checks.osSurfaceWorkspaceIdentity.ok, 'boolean');
    assert.equal(typeof report.checks.osSurfaceWorkspaceIdentity.workspaceId, 'string');
    assert.equal(typeof report.checks.osSurfaceWorkspaceIdentity.modeId, 'string');
    assert.equal(typeof report.checks.osSurfaceWorkspaceIdentity.overlaysCount, 'number');
    assert.equal(typeof report.checks.osSurfaceWorkspaceIdentity.overlaysHash, 'string');

    assert.equal(typeof report.checks.osSurfaceActivationProvenance.ok, 'boolean');
    assert.equal(typeof report.checks.osSurfaceActivationProvenance.tuplesDeterministic, 'boolean');
    assert.equal(typeof report.checks.osSurfaceActivationProvenance.sampleCount, 'number');
    assert.equal(typeof report.checks.osSurfaceActivationProvenance.tuplesHash, 'string');
    assert.equal(typeof report.checks.osSurfaceActivationProvenance.sourceHash, 'string');
    assert.equal(typeof report.checks.osSurfaceActivationProvenance.overlayHash, 'string');

    assert.equal(typeof report.checks.osSurfaceShellClickability.ok, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellClickability.helperPresent, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellClickability.publishGuarded, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellClickability.addKeyframeGuarded, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellClickability.trialGuardCount, 'number');

    assert.equal(typeof report.checks.osSurfaceShellRuntimeProbe.ok, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellRuntimeProbe.skipped, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellRuntimeProbe.required, 'boolean');
    assert.equal(
        report.checks.osSurfaceShellRuntimeProbe.reason === null ||
            typeof report.checks.osSurfaceShellRuntimeProbe.reason === 'string',
        true,
    );
    assert.equal(typeof report.checks.osSurfaceShellRuntimeProbe.publishClickable, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellRuntimeProbe.keyframeClickable, 'boolean');
    assert.equal(typeof report.checks.osSurfaceShellRuntimeProbe.interceptErrors, 'number');
    assert.equal(typeof report.checks.osSurfaceShellRuntimeProbe.durationMs, 'number');

    assert.equal(typeof report.checks.blueprintBootstrapProvenance.ok, 'boolean');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.deterministicManifest, 'boolean');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.persisted, 'boolean');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.replayEquivalent, 'boolean');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.bootstrapEventPersisted, 'boolean');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.perspectiveRoutable, 'boolean');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.defaultPerspectiveId, 'string');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.blueprintId, 'string');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.blueprintVersionId, 'string');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.projectIdHash, 'string');
    assert.equal(typeof report.checks.blueprintBootstrapProvenance.replayParityHash, 'string');
});
