import test from 'node:test';
import assert from 'node:assert/strict';
import { formatReleaseTrustProbeSummary } from '@/scripts/releaseTrustProbeSummary.mjs';

test('release trust probe summary formatter renders stable one-line diagnostics', () => {
    const line = formatReleaseTrustProbeSummary({
        probe: {
            check: {
                ok: true,
                reason: null,
                publishClickable: true,
                keyframeClickable: true,
                interceptErrors: 0,
                durationMs: 1234,
            },
        },
        report: {
            checks: {
                osSurfaceShellContract: {
                    ok: true,
                },
                osSurfaceWorkspaceIdentity: {
                    ok: true,
                },
                osSurfaceActivationProvenance: {
                    ok: true,
                },
                osSurfaceShellRuntimeProbe: {
                    durationMs: 1234,
                },
            },
        },
        baselineProbe: {
            check: {
                durationMs: 1200,
            },
        },
    });

    assert.match(line, /\[ReleaseTrustProbeSummary\] status=PASS/);
    assert.match(line, /failureReason=none/);
    assert.match(line, /publishClickable=true/);
    assert.match(line, /keyframeClickable=true/);
    assert.match(line, /interceptErrors=0/);
    assert.match(line, /shellContractOk=true/);
    assert.match(line, /workspaceIdentityOk=true/);
    assert.match(line, /activationProvenanceOk=true/);
    assert.match(line, /durationMs=1234/);
    assert.match(line, /baselineDurationMs=1200/);
    assert.match(line, /durationDeltaPct=\+2\.8%/);
    assert.match(line, /trend=stable/);
    assert.match(line, /durationStatus=OK/);
});

test('release trust probe summary formatter fails closed for missing probe payload', () => {
    const line = formatReleaseTrustProbeSummary({ probe: null, report: null });
    assert.equal(line, '[ReleaseTrustProbeSummary] status=missing-probe payload');
});

test('release trust probe summary formatter marks regressions and improvements with baseline probe', () => {
    const regressed = formatReleaseTrustProbeSummary({
        probe: {
            check: {
                ok: true,
                reason: 'pointer-intercept-detected',
                publishClickable: true,
                keyframeClickable: true,
                interceptErrors: 0,
                durationMs: 1800,
            },
        },
        baselineProbe: {
            check: {
                durationMs: 1000,
            },
        },
    });
    assert.match(regressed, /failureReason=pointer-intercept-detected/);
    assert.match(regressed, /trend=regressed/);
    assert.match(regressed, /durationStatus=WARN/);
    assert.match(regressed, /durationDeltaPct=\+80\.0%/);

    const improved = formatReleaseTrustProbeSummary({
        probe: {
            check: {
                ok: true,
                publishClickable: true,
                keyframeClickable: true,
                interceptErrors: 0,
                durationMs: 800,
            },
        },
        baselineProbe: {
            check: {
                durationMs: 1000,
            },
        },
    });
    assert.match(improved, /trend=improved/);
    assert.match(improved, /durationStatus=OK/);
    assert.match(improved, /durationDeltaPct=-20\.0%/);
    assert.match(improved, /shellContractOk=unknown/);
    assert.match(improved, /workspaceIdentityOk=unknown/);
    assert.match(improved, /activationProvenanceOk=unknown/);
});
