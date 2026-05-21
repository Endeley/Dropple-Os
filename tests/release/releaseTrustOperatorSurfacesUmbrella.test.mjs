import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildReleaseTrustSummary } from '@/scripts/releaseTrustSummary.mjs';
import { buildReleaseTrustCommentBody, RELEASE_TRUST_COMMENT_MARKER } from '@/scripts/releaseTrustPrComment.mjs';
import {
    createReleaseTrustProbeBaselineFixture,
    createReleaseTrustProbeFixture,
    createReleaseTrustReportFixture,
} from './releaseTrustTestFixtures.mjs';

test('release trust operator surfaces remain aligned across summary CLI, probe CLI, and PR payload assembly', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-trust-umbrella-'));
    const currentPath = path.join(tempDir, 'current.json');
    const baselinePath = path.join(tempDir, 'baseline.json');
    const probePath = path.join(tempDir, 'probe.json');
    const probeBaselinePath = path.join(tempDir, 'probe-baseline.json');
    const report = createReleaseTrustReportFixture();
    const probe = createReleaseTrustProbeFixture({ report });
    const probeBaseline = createReleaseTrustProbeBaselineFixture({ durationMs: 1200 });

    fs.writeFileSync(currentPath, JSON.stringify(report), 'utf8');
    fs.writeFileSync(baselinePath, JSON.stringify(report), 'utf8');
    fs.writeFileSync(probePath, JSON.stringify(probe), 'utf8');
    fs.writeFileSync(probeBaselinePath, JSON.stringify(probeBaseline), 'utf8');

    const summaryCli = spawnSync(
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
    assert.equal(summaryCli.status, 0, summaryCli.stderr || 'releaseTrustSummary CLI failed');
    const summaryStdout = String(summaryCli.stdout ?? '');
    assert.match(summaryStdout, /OS Surface Shell Contract/);
    assert.match(summaryStdout, /OS Surface Workspace Identity/);
    assert.match(summaryStdout, /OS Surface Activation Provenance/);

    const probeCli = spawnSync(
        'node',
        ['--import', './bench/register-alias-loader.mjs', 'scripts/releaseTrustProbeSummary.mjs'],
        {
            cwd: process.cwd(),
            env: {
                ...process.env,
                RELEASE_TRUST_UI_PROBE_PATH: probePath,
                RELEASE_TRUST_UI_PROBE_BASELINE_PATH: probeBaselinePath,
                RELEASE_TRUST_CURRENT_PATH: currentPath,
                RELEASE_TRUST_BASELINE_PATH: baselinePath,
            },
            encoding: 'utf8',
        },
    );
    assert.equal(probeCli.status, 0, probeCli.stderr || 'releaseTrustProbeSummary CLI failed');
    const probeStdout = String(probeCli.stdout ?? '');
    assert.match(probeStdout, /shellContractOk=true/);
    assert.match(probeStdout, /workspaceIdentityOk=true/);
    assert.match(probeStdout, /activationProvenanceOk=true/);

    const summary = buildReleaseTrustSummary({
        currentPath,
        baselinePath,
        strict: 'false',
    });
    const commentPayload = buildReleaseTrustCommentBody(summary);
    assert.match(commentPayload, new RegExp(RELEASE_TRUST_COMMENT_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(commentPayload, /OS Surface Shell Contract/);
    assert.match(commentPayload, /OS Surface Workspace Identity/);
    assert.match(commentPayload, /OS Surface Activation Provenance/);
    assert.match(commentPayload, /OS Surface Probe/);
});
