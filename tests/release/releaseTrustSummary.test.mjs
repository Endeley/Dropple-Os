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
    });
    const b = formatReleaseTrustSummary({
        result,
        strict: false,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        ledger: { ok: true, entryCount: 12, reason: null, index: null },
    });

    assert.equal(a, b);
    assert.match(a, /Release Trust Diff Summary/);
    assert.match(a, /Constitutional Regressions/);
    assert.match(a, /Semantic Drift/);
    assert.match(a, /Lawful Evolution/);
    assert.match(a, /Ledger entries: `12`/);
    assert.match(a, /Ledger chain: `ok`/);
});
