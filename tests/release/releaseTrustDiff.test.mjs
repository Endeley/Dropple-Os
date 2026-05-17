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
            architectureGate: { ok: true },
            exportVerification: { ok: true },
            federationAttestation: { ok: true },
            simulationTrace: { ok: true },
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
