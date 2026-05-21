import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createReleaseTrustReportFixture } from './releaseTrustTestFixtures.mjs';

test('releaseTrustSummary CLI prints explicit OS surface shell sections from report input', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-trust-summary-cli-'));
    const currentPath = path.join(tempDir, 'current.json');
    const baselinePath = path.join(tempDir, 'baseline.json');
    const report = createReleaseTrustReportFixture({ runtimeProbeDurationMs: 1200, reportHash: 'r' });

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
