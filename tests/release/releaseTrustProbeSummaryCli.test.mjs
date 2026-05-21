import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
    createReleaseTrustProbeBaselineFixture,
    createReleaseTrustProbeFixture,
    createReleaseTrustReportFixture,
} from './releaseTrustTestFixtures.mjs';

test('releaseTrustProbeSummary CLI prints shell signal fields and probe diagnostics', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-trust-probe-summary-cli-'));
    const probePath = path.join(tempDir, 'probe.json');
    const baselineProbePath = path.join(tempDir, 'probe-baseline.json');
    const reportPath = path.join(tempDir, 'report.json');

    const reportPayload = createReleaseTrustReportFixture({ runtimeProbeDurationMs: 1300 });
    const probePayload = createReleaseTrustProbeFixture({ report: reportPayload });
    const baselineProbePayload = createReleaseTrustProbeBaselineFixture({ durationMs: 1200 });

    fs.writeFileSync(probePath, JSON.stringify(probePayload), 'utf8');
    fs.writeFileSync(baselineProbePath, JSON.stringify(baselineProbePayload), 'utf8');
    fs.writeFileSync(reportPath, JSON.stringify(reportPayload), 'utf8');

    const result = spawnSync(
        'node',
        ['--import', './bench/register-alias-loader.mjs', 'scripts/releaseTrustProbeSummary.mjs'],
        {
            cwd: process.cwd(),
            env: {
                ...process.env,
                RELEASE_TRUST_UI_PROBE_PATH: probePath,
                RELEASE_TRUST_UI_PROBE_BASELINE_PATH: baselineProbePath,
                RELEASE_TRUST_CURRENT_PATH: reportPath,
                RELEASE_TRUST_BASELINE_PATH: reportPath,
            },
            encoding: 'utf8',
        },
    );

    assert.equal(result.status, 0, result.stderr || 'releaseTrustProbeSummary CLI failed');
    const stdout = String(result.stdout ?? '');
    assert.match(stdout, /\[ReleaseTrustProbeSummary\] status=PASS/);
    assert.match(stdout, /failureReason=none/);
    assert.match(stdout, /publishClickable=true/);
    assert.match(stdout, /keyframeClickable=true/);
    assert.match(stdout, /interceptErrors=0/);
    assert.match(stdout, /shellContractOk=true/);
    assert.match(stdout, /workspaceIdentityOk=true/);
    assert.match(stdout, /activationProvenanceOk=true/);
    assert.match(stdout, /durationMs=1300/);
    assert.match(stdout, /baselineDurationMs=1200/);
});
