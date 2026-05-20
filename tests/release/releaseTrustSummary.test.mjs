import test from 'node:test';
import assert from 'node:assert/strict';
import { formatReleaseTrustSummary } from '@/scripts/releaseTrustSummary.mjs';

test('release trust summary formatter is deterministic for identical semantic outcomes', () => {
    const result = Object.freeze({
        ok: false,
        errors: Object.freeze(['architectureGate.ok: architecture gate failed in current report.']),
        warnings: Object.freeze(['baseline report unavailable; diff skipped.']),
        deltas: Object.freeze(['exportVerification.exportHash: exportHash changed.']),
        outcomes: Object.freeze([
            Object.freeze({
                ok: false,
                severity: 'error',
                invariant: 'architectureGate.ok',
                classification: 'constitutional-regression',
                message: 'architecture gate failed in current report.',
            }),
            Object.freeze({
                ok: true,
                severity: 'info',
                invariant: 'simulationTrace.ok',
                classification: 'lawful-evolution',
                message: 'simulation trace validation remains valid.',
            }),
        ]),
    });

    const a = formatReleaseTrustSummary({
        result,
        strict: false,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        ledger: { ok: true, entryCount: 12, reason: null, index: null },
        federationLineage: {
            lineageHash: 'lineage-hash-a',
            tamperRejected: true,
            replayEquivalent: true,
            staleRejected: true,
            orderingClosed: true,
        },
        federationLineageLedger: { ok: true, entryCount: 7, reason: null, index: null },
        osSurfaceProbeCurrent: {
            publishClickable: true,
            keyframeClickable: true,
            interceptErrors: 0,
            reason: null,
            durationMs: 1700,
        },
        osSurfaceProbeBaseline: {
            durationMs: 1000,
        },
    });
    const b = formatReleaseTrustSummary({
        result,
        strict: false,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        ledger: { ok: true, entryCount: 12, reason: null, index: null },
        federationLineage: {
            lineageHash: 'lineage-hash-a',
            tamperRejected: true,
            replayEquivalent: true,
            staleRejected: true,
            orderingClosed: true,
        },
        federationLineageLedger: { ok: true, entryCount: 7, reason: null, index: null },
        osSurfaceProbeCurrent: {
            publishClickable: true,
            keyframeClickable: true,
            interceptErrors: 0,
            reason: null,
            durationMs: 1700,
        },
        osSurfaceProbeBaseline: {
            durationMs: 1000,
        },
    });

    assert.equal(a, b);
    assert.match(a, /Release Trust Diff Summary/);
    assert.match(a, /Constitutional Regressions/);
    assert.match(a, /Semantic Drift/);
    assert.match(a, /Lawful Evolution/);
    assert.match(a, /Ledger entries: `12`/);
    assert.match(a, /Ledger chain: `ok`/);
    assert.match(a, /Federation lineage hash: `lineage-hash-a`/);
    assert.match(a, /Federation replay equivalent: `true`/);
    assert.match(a, /Federation lineage ledger entries: `7`/);
    assert.match(a, /Federation lineage ledger chain: `ok`/);
    assert.match(a, /OS Surface Probe/);
    assert.match(a, /Publish clickable: `true`/);
    assert.match(a, /Keyframe clickable: `true`/);
    assert.match(a, /Failure reason: `none`/);
    assert.match(a, /Duration \(current\): `1700ms`/);
    assert.match(a, /Duration \(baseline\): `1000ms`/);
    assert.match(a, /Duration delta: `\+70.0%`/);
    assert.match(a, /Duration status: `OK`/);
});

test('release trust summary surfaces runtime probe duration warning as non-blocking signal', () => {
    const result = Object.freeze({
        ok: true,
        errors: Object.freeze([]),
        warnings: Object.freeze([]),
        deltas: Object.freeze(['osSurfaceShellRuntimeProbe.duration-regression: drift']),
        outcomes: Object.freeze([
            Object.freeze({
                ok: true,
                severity: 'warning',
                invariant: 'osSurfaceShellRuntimeProbe.duration-regression',
                classification: 'semantic-drift',
                message: 'runtime probe duration regressed (1000ms -> 1700ms, 170.0%).',
            }),
        ]),
    });

    const summary = formatReleaseTrustSummary({
        result,
        osSurfaceProbeCurrent: {
            publishClickable: true,
            keyframeClickable: true,
            interceptErrors: 0,
            reason: 'pointer-intercept-detected',
            durationMs: 1700,
        },
        osSurfaceProbeBaseline: {
            durationMs: 1000,
        },
    });

    assert.match(summary, /Duration status: `WARN`/);
    assert.match(summary, /Failure reason: `pointer-intercept-detected`/);
    assert.match(summary, /runtime probe duration regressed/);
});
