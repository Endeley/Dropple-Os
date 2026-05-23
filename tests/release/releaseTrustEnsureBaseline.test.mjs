import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureReleaseTrustBaseline } from '@/scripts/releaseTrustEnsureBaseline.mjs';

function makePaths(dir) {
    return {
        currentReportPath: path.join(dir, 'release-trust.json'),
        baselineReportPath: path.join(dir, 'release-trust-baseline.json'),
        currentProbePath: path.join(dir, 'os-surface-clickability-probe.json'),
        baselineProbePath: path.join(dir, 'os-surface-clickability-probe-baseline.json'),
    };
}

test('release trust baseline ensure is noop when baseline artifacts already exist', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-baseline-ensure-'));
    const paths = makePaths(dir);
    fs.writeFileSync(paths.baselineReportPath, JSON.stringify({ schemaVersion: '1.0.0' }), 'utf8');

    const result = ensureReleaseTrustBaseline({
        ...paths,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        nowMs: Date.parse('2026-08-01T00:00:00.000Z'),
    });

    assert.equal(result.ok, true);
    assert.equal(result.action, 'noop');
    assert.equal(result.reason, 'baseline-present');
});

test('release trust baseline ensure captures baseline from current artifacts when baseline is missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-baseline-ensure-'));
    const paths = makePaths(dir);
    fs.writeFileSync(paths.currentReportPath, JSON.stringify({ schemaVersion: '1.0.0' }), 'utf8');
    fs.writeFileSync(paths.currentProbePath, JSON.stringify({ check: { durationMs: 1000 } }), 'utf8');

    const result = ensureReleaseTrustBaseline({
        ...paths,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        nowMs: Date.parse('2026-06-01T00:00:00.000Z'),
    });

    assert.equal(result.ok, true);
    assert.equal(result.action, 'captured');
    assert.equal(result.reason, 'captured-from-current');
    assert.deepEqual(JSON.parse(fs.readFileSync(paths.baselineReportPath, 'utf8')), { schemaVersion: '1.0.0' });
    assert.deepEqual(JSON.parse(fs.readFileSync(paths.baselineProbePath, 'utf8')), { check: { durationMs: 1000 } });
});

test('release trust baseline ensure fails open before cutoff when baseline and current artifacts are unavailable', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-baseline-ensure-'));
    const paths = makePaths(dir);

    const result = ensureReleaseTrustBaseline({
        ...paths,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        nowMs: Date.parse('2026-06-01T00:00:00.000Z'),
    });

    assert.equal(result.ok, true);
    assert.equal(result.action, 'missing');
    assert.equal(result.reason, 'baseline-unavailable-pre-cutoff');
    assert.equal(typeof result.warning, 'string');
});

test('release trust baseline ensure fails closed after cutoff when baseline and current artifacts are unavailable', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-baseline-ensure-'));
    const paths = makePaths(dir);

    const result = ensureReleaseTrustBaseline({
        ...paths,
        baselineRequiredAfter: '2026-07-01T00:00:00.000Z',
        nowMs: Date.parse('2026-08-01T00:00:00.000Z'),
    });

    assert.equal(result.ok, false);
    assert.equal(result.action, 'missing');
    assert.equal(result.reason, 'baseline-required-after-cutoff');
    assert.equal(result.enforced, true);
});
