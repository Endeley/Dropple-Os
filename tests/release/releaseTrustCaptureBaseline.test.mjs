import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { captureReleaseTrustBaseline } from '@/scripts/releaseTrustCaptureBaseline.mjs';

test('release trust baseline capture copies current report and probe artifacts', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-baseline-'));
    const currentReportPath = path.join(dir, 'release-trust.json');
    const currentProbePath = path.join(dir, 'os-surface-clickability-probe.json');
    const baselineReportPath = path.join(dir, 'release-trust-baseline.json');
    const baselineProbePath = path.join(dir, 'os-surface-clickability-probe-baseline.json');

    fs.writeFileSync(currentReportPath, JSON.stringify({ schemaVersion: '1.0.0' }), 'utf8');
    fs.writeFileSync(currentProbePath, JSON.stringify({ check: { durationMs: 1000 } }), 'utf8');

    const result = captureReleaseTrustBaseline({
        currentReportPath,
        baselineReportPath,
        currentProbePath,
        baselineProbePath,
    });

    assert.equal(result.ok, true);
    assert.equal(result.report.copied, true);
    assert.equal(result.probe.copied, true);
    assert.deepEqual(JSON.parse(fs.readFileSync(baselineReportPath, 'utf8')), { schemaVersion: '1.0.0' });
    assert.deepEqual(JSON.parse(fs.readFileSync(baselineProbePath, 'utf8')), { check: { durationMs: 1000 } });
});
