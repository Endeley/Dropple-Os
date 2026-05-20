import test from 'node:test';
import assert from 'node:assert/strict';
import { diffReleaseTrustReports } from '@/scripts/releaseTrustDiff.mjs';

function createReport({
    schemaVersion = '1.0.0',
    checks = {},
} = {}) {
    return {
        schemaVersion,
        overallOk: true,
        checks: {
            architectureGate: { ok: true, exitCode: 0 },
            exportVerification: {
                ok: true,
                exportHash: 'hash-a',
                canonicalVersion: 'dropple-export@1',
                algorithm: 'sha-256',
            },
            federationAttestation: { ok: true, tamperRejected: true, hash: 'fed-hash-a', entryCount: 1 },
            federationLifecycle: { ok: true, replayEquivalent: true, staleRejected: true, orderingClosed: true },
            osSurfaceIntentRouting: {
                ok: true,
                mutationFree: true,
                acceptedCount: 4,
                rejectedCount: 6,
                allowlistPolicyVersion: '1',
                allowlistActionCount: 4,
                allowlistActionHash: 'os-allowlist-hash-a',
            },
            osSurfaceShellClickability: {
                ok: true,
                helperPresent: true,
                publishGuarded: true,
                addKeyframeGuarded: true,
                trialGuardCount: 2,
            },
            osSurfaceShellRuntimeProbe: {
                ok: true,
                skipped: false,
                required: true,
                reason: null,
                publishClickable: true,
                keyframeClickable: true,
                interceptErrors: 0,
            },
            simulationTrace: {
                ok: true,
                fingerprint: 'sim-fingerprint-a',
                primitiveTraceLineageProvided: true,
                tamperRejected: true,
            },
            ...checks,
        },
        reportHash: 'hash-a',
    };
}

test('release trust diff fails on schema version downgrade', () => {
    const baseline = createReport({ schemaVersion: '2.0.0' });
    const current = createReport({ schemaVersion: '1.0.0' });
    const result = diffReleaseTrustReports({ baseline, current });

    assert.equal(result.ok, false);
    assert.equal(result.errors.some((entry) => entry.includes('schema version downgraded')), true);
});

test('release trust diff fails when required check disappears', () => {
    const baseline = createReport();
    const current = createReport();
    delete current.checks.federationAttestation;

    const result = diffReleaseTrustReports({ baseline, current });
    assert.equal(result.ok, false);
    assert.equal(result.errors.some((entry) => entry.includes('required check disappeared: federationAttestation')), true);
});

test('release trust diff fails on constitutional federation tamper regression', () => {
    const baseline = createReport({
        checks: {
            federationAttestation: { ok: true, tamperRejected: true, hash: 'a' },
        },
    });
    const current = createReport({
        checks: {
            federationAttestation: { ok: false, tamperRejected: false, hash: 'a' },
        },
    });

    const result = diffReleaseTrustReports({ baseline, current });
    assert.equal(result.ok, false);
    assert.equal(result.errors.some((entry) => entry.includes('federationAttestation.ok')), true);
    assert.equal(result.errors.some((entry) => entry.includes('federationAttestation.tamperRejected')), true);
});

test('release trust diff fails on constitutional federation replay-equivalence regression', () => {
    const baseline = createReport({
        checks: {
            federationLifecycle: { ok: true, replayEquivalent: true, staleRejected: true, orderingClosed: true },
        },
    });
    const current = createReport({
        checks: {
            federationLifecycle: { ok: false, replayEquivalent: false, staleRejected: true, orderingClosed: true },
        },
    });

    const result = diffReleaseTrustReports({ baseline, current });
    assert.equal(result.ok, false);
    assert.equal(result.errors.some((entry) => entry.includes('federationLifecycle.ok')), true);
    assert.equal(result.errors.some((entry) => entry.includes('federationLifecycle.replayEquivalent')), true);
});

test('release trust diff fails on constitutional os surface intent-routing regression', () => {
    const baseline = createReport({
        checks: {
            osSurfaceIntentRouting: {
                ok: true,
                mutationFree: true,
                acceptedCount: 4,
                rejectedCount: 6,
                allowlistPolicyVersion: '1',
                allowlistActionCount: 4,
                allowlistActionHash: 'os-allowlist-hash-a',
            },
        },
    });
    const current = createReport({
        checks: {
            osSurfaceIntentRouting: {
                ok: false,
                mutationFree: false,
                acceptedCount: 4,
                rejectedCount: 6,
                allowlistPolicyVersion: '1',
                allowlistActionCount: 4,
                allowlistActionHash: 'os-allowlist-hash-a',
            },
        },
    });

    const result = diffReleaseTrustReports({ baseline, current });
    assert.equal(result.ok, false);
    assert.equal(result.errors.some((entry) => entry.includes('osSurfaceIntentRouting.ok')), true);
    assert.equal(result.errors.some((entry) => entry.includes('osSurfaceIntentRouting.mutationFree')), true);
});

test('release trust diff fails when os surface allowlist hash drifts', () => {
    const baseline = createReport({
        checks: {
            osSurfaceIntentRouting: {
                ok: true,
                mutationFree: true,
                acceptedCount: 4,
                rejectedCount: 6,
                allowlistPolicyVersion: '1',
                allowlistActionCount: 4,
                allowlistActionHash: 'os-allowlist-hash-a',
            },
        },
    });
    const current = createReport({
        checks: {
            osSurfaceIntentRouting: {
                ok: true,
                mutationFree: true,
                acceptedCount: 4,
                rejectedCount: 6,
                allowlistPolicyVersion: '1',
                allowlistActionCount: 5,
                allowlistActionHash: 'os-allowlist-hash-b',
            },
        },
    });

    const result = diffReleaseTrustReports({ baseline, current });
    assert.equal(result.ok, false);
    assert.equal(
        result.errors.some((entry) => entry.includes('osSurfaceIntentRouting.allowlistActionHash-stable')),
        true,
    );
});

test('release trust diff fails on constitutional os surface shell clickability regression', () => {
    const baseline = createReport({
        checks: {
            osSurfaceShellClickability: {
                ok: true,
                helperPresent: true,
                publishGuarded: true,
                addKeyframeGuarded: true,
                trialGuardCount: 2,
            },
        },
    });
    const current = createReport({
        checks: {
            osSurfaceShellClickability: {
                ok: false,
                helperPresent: false,
                publishGuarded: false,
                addKeyframeGuarded: true,
                trialGuardCount: 0,
            },
        },
    });

    const result = diffReleaseTrustReports({ baseline, current });
    assert.equal(result.ok, false);
    assert.equal(result.errors.some((entry) => entry.includes('osSurfaceShellClickability.ok')), true);
    assert.equal(result.errors.some((entry) => entry.includes('osSurfaceShellClickability.helperPresent')), true);
    assert.equal(result.errors.some((entry) => entry.includes('osSurfaceShellClickability.publishGuarded')), true);
    assert.equal(result.errors.some((entry) => entry.includes('osSurfaceShellClickability.trialGuardCount')), true);
});

test('release trust diff fails when required os surface runtime probe is skipped or fails', () => {
    const baseline = createReport({
        checks: {
            osSurfaceShellRuntimeProbe: {
                ok: true,
                skipped: false,
                required: true,
                reason: null,
                publishClickable: true,
                keyframeClickable: true,
                interceptErrors: 0,
            },
        },
    });
    const current = createReport({
        checks: {
            osSurfaceShellRuntimeProbe: {
                ok: false,
                skipped: true,
                required: true,
                reason: 'probe-required-but-disabled',
                publishClickable: false,
                keyframeClickable: false,
                interceptErrors: 2,
            },
        },
    });

    const result = diffReleaseTrustReports({ baseline, current });
    assert.equal(result.ok, false);
    assert.equal(
        result.errors.some((entry) => entry.includes('osSurfaceShellRuntimeProbe.required-not-skipped')),
        true,
    );
    assert.equal(result.errors.some((entry) => entry.includes('osSurfaceShellRuntimeProbe.ok')), false);
});

test('release trust diff treats hash changes as deltas in non-strict mode', () => {
    const baseline = createReport({
        checks: {
            exportVerification: {
                ok: true,
                exportHash: 'hash-a',
                canonicalVersion: 'dropple-export@1',
                algorithm: 'sha-256',
            },
        },
    });
    const current = createReport({
        checks: {
            exportVerification: {
                ok: true,
                exportHash: 'hash-b',
                canonicalVersion: 'dropple-export@1',
                algorithm: 'sha-256',
            },
        },
    });

    const result = diffReleaseTrustReports({ baseline, current, strict: false });
    assert.equal(result.ok, true);
    assert.equal(result.deltas.some((entry) => entry.includes('exportVerification.exportHash')), true);
});

test('release trust diff treats hash changes as errors in strict mode', () => {
    const baseline = createReport({
        checks: {
            exportVerification: {
                ok: true,
                exportHash: 'hash-a',
                canonicalVersion: 'dropple-export@1',
                algorithm: 'sha-256',
            },
        },
    });
    const current = createReport({
        checks: {
            exportVerification: {
                ok: true,
                exportHash: 'hash-b',
                canonicalVersion: 'dropple-export@1',
                algorithm: 'sha-256',
            },
        },
    });

    const result = diffReleaseTrustReports({ baseline, current, strict: true });
    assert.equal(result.ok, false);
    assert.equal(result.errors.some((entry) => entry.includes('exportVerification.exportHash')), true);
});

test('release trust diff is non-blocking when baseline is unavailable', () => {
    const current = createReport();
    const result = diffReleaseTrustReports({ baseline: null, current });

    assert.equal(result.ok, true);
    assert.equal(result.warnings.some((entry) => entry.includes('baseline report unavailable')), true);
});

test('release trust diff is non-blocking before baseline enforcement cutoff', () => {
    const current = createReport();
    const result = diffReleaseTrustReports({
        baseline: null,
        current,
        nowMs: Date.parse('2026-05-17T00:00:00.000Z'),
        baselineRequiredAfter: '2026-06-30T00:00:00.000Z',
    });

    assert.equal(result.ok, true);
    assert.equal(result.warnings.some((entry) => entry.includes('baseline report unavailable')), true);
});

test('release trust diff fails when baseline is unavailable after enforcement cutoff', () => {
    const current = createReport();
    const result = diffReleaseTrustReports({
        baseline: null,
        current,
        nowMs: Date.parse('2026-07-01T00:00:00.000Z'),
        baselineRequiredAfter: '2026-06-30T00:00:00.000Z',
    });

    assert.equal(result.ok, false);
    assert.equal(
        result.errors.some((entry) => entry.includes('baseline report unavailable after enforcement cutoff')),
        true,
    );
});
