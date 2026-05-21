import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function createReportWithShellSections() {
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
                durationMs: 1200,
            },
        },
        reportHash: 'r',
    };
}

test('releaseTrustSummary CLI prints explicit OS surface shell sections from report input', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-trust-summary-cli-'));
    const currentPath = path.join(tempDir, 'current.json');
    const baselinePath = path.join(tempDir, 'baseline.json');
    const report = createReportWithShellSections();

    fs.writeFileSync(currentPath, JSON.stringify(report), 'utf8');
    fs.writeFileSync(baselinePath, JSON.stringify(report), 'utf8');

    const result = spawnSync(
        'node',
        ['--import', './bench/register-alias-loader.mjs', 'scripts/releaseTrustSummary.mjs'],
        {
            cwd: process.cwd(),
            env: {
                ...process.env,
                RELEASE_TRUST_CURRENT_PATH: currentPath,
                RELEASE_TRUST_BASELINE_PATH: baselinePath,
                RELEASE_TRUST_DIFF_STRICT: 'false',
            },
            encoding: 'utf8',
        },
    );

    assert.equal(result.status, 0, result.stderr || 'releaseTrustSummary CLI failed');
    const stdout = String(result.stdout ?? '');
    assert.match(stdout, /Release Trust Diff Summary/);
    assert.match(stdout, /OS Surface Shell Contract/);
    assert.match(stdout, /OS Surface Workspace Identity/);
    assert.match(stdout, /OS Surface Activation Provenance/);
});
