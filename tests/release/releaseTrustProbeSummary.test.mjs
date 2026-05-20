import test from 'node:test';
import assert from 'node:assert/strict';
import { formatReleaseTrustProbeSummary } from '@/scripts/releaseTrustProbeSummary.mjs';

test('release trust probe summary formatter renders stable one-line diagnostics', () => {
    const line = formatReleaseTrustProbeSummary({
        probe: {
            check: {
                ok: true,
                publishClickable: true,
                keyframeClickable: true,
                interceptErrors: 0,
                durationMs: 1234,
            },
        },
        report: {
            checks: {
                osSurfaceShellRuntimeProbe: {
                    durationMs: 1234,
                },
            },
        },
    });

    assert.match(line, /\[ReleaseTrustProbeSummary\] status=PASS/);
    assert.match(line, /publishClickable=true/);
    assert.match(line, /keyframeClickable=true/);
    assert.match(line, /interceptErrors=0/);
    assert.match(line, /durationMs=1234/);
    assert.match(line, /durationStatus=OK/);
});

test('release trust probe summary formatter fails closed for missing probe payload', () => {
    const line = formatReleaseTrustProbeSummary({ probe: null, report: null });
    assert.equal(line, '[ReleaseTrustProbeSummary] status=missing-probe payload');
});
