import test from 'node:test';
import assert from 'node:assert/strict';
import {
    normalizeOsSurfaceClickabilityProbeResult,
    parseOsSurfaceClickabilityJsonReport,
} from '@/scripts/releaseTrustChecks/osSurfaceClickabilityProbe.mjs';

function createJsonReporterPayload({
    publishStatus = 'passed',
    keyframeStatus = 'passed',
} = {}) {
    return JSON.stringify({
        suites: [
            {
                specs: [
                    {
                        tests: [
                            {
                                titlePath: [
                                    'tests/e2e/uiux-template-generation.spec.js',
                                    'uiux authoring roundtrip publishes from the toolbar flow and installs into a fresh workspace',
                                ],
                                results: [{ status: publishStatus }],
                            },
                            {
                                titlePath: [
                                    'tests/e2e/uiux-template-generation.spec.js',
                                    'uiux transition timeline can author a motion keyframe through lawful intents',
                                ],
                                results: [{ status: keyframeStatus }],
                            },
                        ],
                    },
                ],
            },
        ],
    });
}

test('parseOsSurfaceClickabilityJsonReport extracts pass states deterministically', () => {
    const parsed = parseOsSurfaceClickabilityJsonReport(createJsonReporterPayload());
    assert.equal(parsed.ok, true);
    assert.equal(parsed.publishClickable, true);
    assert.equal(parsed.keyframeClickable, true);
    assert.equal(parsed.reason, null);
    assert.equal(parsed.matchedTestCount, 2);
});

test('parseOsSurfaceClickabilityJsonReport fails closed when expected tests are missing', () => {
    const parsed = parseOsSurfaceClickabilityJsonReport(JSON.stringify({ suites: [] }));
    assert.equal(parsed.ok, false);
    assert.equal(parsed.reason, 'missing-expected-tests');
});

test('parseOsSurfaceClickabilityJsonReport fails closed on malformed json', () => {
    const parsed = parseOsSurfaceClickabilityJsonReport('not-json');
    assert.equal(parsed.ok, false);
    assert.equal(parsed.reason, 'invalid-json-report');
});

test('normalizeOsSurfaceClickabilityProbeResult fails closed on parse/run mismatch', () => {
    const parsed = parseOsSurfaceClickabilityJsonReport(createJsonReporterPayload());
    const normalized = normalizeOsSurfaceClickabilityProbeResult({
        runOk: false,
        parsedReport: parsed,
        interceptErrors: 0,
        durationMs: 55,
        exitCode: 1,
    });
    assert.equal(normalized.ok, false);
    assert.equal(normalized.reason, 'playwright-exit-nonzero');
});

test('normalizeOsSurfaceClickabilityProbeResult fails closed on intercept evidence', () => {
    const parsed = parseOsSurfaceClickabilityJsonReport(createJsonReporterPayload());
    const normalized = normalizeOsSurfaceClickabilityProbeResult({
        runOk: true,
        parsedReport: parsed,
        interceptErrors: 2,
        durationMs: 33,
        exitCode: 0,
    });
    assert.equal(normalized.ok, false);
    assert.equal(normalized.reason, 'pointer-intercept-detected');
    assert.equal(normalized.interceptErrors, 2);
});

test('normalizeOsSurfaceClickabilityProbeResult classifies malformed json as parse failure', () => {
    const parsed = parseOsSurfaceClickabilityJsonReport('not-json');
    const normalized = normalizeOsSurfaceClickabilityProbeResult({
        runOk: true,
        parsedReport: parsed,
        interceptErrors: 0,
        durationMs: 12,
        exitCode: 0,
    });
    assert.equal(normalized.ok, false);
    assert.equal(normalized.reason, 'json-parse-failure');
});

test('normalizeOsSurfaceClickabilityProbeResult classifies missing expected tests', () => {
    const parsed = parseOsSurfaceClickabilityJsonReport(JSON.stringify({ suites: [] }));
    const normalized = normalizeOsSurfaceClickabilityProbeResult({
        runOk: true,
        parsedReport: parsed,
        interceptErrors: 0,
        durationMs: 12,
        exitCode: 0,
    });
    assert.equal(normalized.ok, false);
    assert.equal(normalized.reason, 'missing-expected-tests');
});
