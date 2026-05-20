import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLISH_TEST_NAME =
    'uiux authoring roundtrip publishes from the toolbar flow and installs into a fresh workspace';
const KEYFRAME_TEST_NAME =
    'uiux transition timeline can author a motion keyframe through lawful intents';

const PROBED_TEST_NAMES = Object.freeze([PUBLISH_TEST_NAME, KEYFRAME_TEST_NAME]);

function buildPlaywrightGrepPattern(testNames = PROBED_TEST_NAMES) {
    return testNames
        .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
}

function summarizeTestTitle(test) {
    const titlePath = Array.isArray(test?.titlePath) ? test.titlePath : [];
    if (titlePath.length > 0) return titlePath.join(' › ');
    if (typeof test?.title === 'string') return test.title;
    return '';
}

function collectTestsFromReport(reportNode, collected = []) {
    const suites = Array.isArray(reportNode?.suites) ? reportNode.suites : [];
    for (const suite of suites) {
        collectTestsFromReport(suite, collected);
    }

    const specs = Array.isArray(reportNode?.specs) ? reportNode.specs : [];
    for (const spec of specs) {
        const tests = Array.isArray(spec?.tests) ? spec.tests : [];
        for (const test of tests) {
            const results = Array.isArray(test?.results) ? test.results : [];
            const lastResult = results.length > 0 ? results[results.length - 1] : null;
            collected.push(Object.freeze({
                title: summarizeTestTitle(test),
                status: typeof lastResult?.status === 'string' ? lastResult.status : null,
            }));
        }
    }
    return collected;
}

export function parseOsSurfaceClickabilityJsonReport(jsonText, {
    expectedTestNames = PROBED_TEST_NAMES,
} = {}) {
    if (typeof jsonText !== 'string' || jsonText.trim().length === 0) {
        return Object.freeze({
            ok: false,
            reason: 'invalid-json-report',
            publishClickable: false,
            keyframeClickable: false,
            matchedTestCount: 0,
        });
    }

    let parsed = null;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        return Object.freeze({
            ok: false,
            reason: 'invalid-json-report',
            publishClickable: false,
            keyframeClickable: false,
            matchedTestCount: 0,
        });
    }

    const tests = collectTestsFromReport(parsed, []);
    const matched = tests.filter((entry) => expectedTestNames.some((name) => entry.title.includes(name)));

    const publishEntry = matched.find((entry) => entry.title.includes(PUBLISH_TEST_NAME));
    const keyframeEntry = matched.find((entry) => entry.title.includes(KEYFRAME_TEST_NAME));

    const publishClickable = publishEntry?.status === 'passed';
    const keyframeClickable = keyframeEntry?.status === 'passed';
    const matchedAll = Boolean(publishEntry) && Boolean(keyframeEntry);

    if (!matchedAll) {
        return Object.freeze({
            ok: false,
            reason: 'missing-expected-tests',
            publishClickable,
            keyframeClickable,
            matchedTestCount: matched.length,
        });
    }

    return Object.freeze({
        ok: publishClickable && keyframeClickable,
        reason: null,
        publishClickable,
        keyframeClickable,
        matchedTestCount: matched.length,
    });
}

export function normalizeOsSurfaceClickabilityProbeResult({
    runOk = false,
    parsedReport = null,
    interceptErrors = 0,
    durationMs = 0,
    exitCode = 1,
    stdoutTail = null,
    stderrTail = null,
} = {}) {
    const publishClickable = parsedReport?.publishClickable === true;
    const keyframeClickable = parsedReport?.keyframeClickable === true;
    const normalizedInterceptErrors = Number.isFinite(interceptErrors) ? Number(interceptErrors) : 0;
    const normalizedDurationMs = Number.isFinite(durationMs) && Number(durationMs) >= 0 ? Number(durationMs) : 0;

    const parseReason = parsedReport?.reason ?? null;
    const failureReason =
        runOk !== true
            ? 'playwright-exit-nonzero'
            : parseReason === 'invalid-json-report'
                ? 'json-parse-failure'
                : parseReason === 'missing-expected-tests'
                    ? 'missing-expected-tests'
                    : normalizedInterceptErrors > 0
                        ? 'pointer-intercept-detected'
                        : parseReason === null && publishClickable && keyframeClickable
                            ? null
                            : 'unknown-probe-failure';

    return Object.freeze({
        ok:
            runOk === true &&
            parsedReport?.ok === true &&
            parsedReport?.reason == null &&
            publishClickable &&
            keyframeClickable &&
            normalizedInterceptErrors === 0,
        reason: failureReason,
        publishClickable,
        keyframeClickable,
        interceptErrors: normalizedInterceptErrors,
        durationMs: normalizedDurationMs,
        matchedTestCount: Number.isFinite(parsedReport?.matchedTestCount) ? Number(parsedReport.matchedTestCount) : 0,
        exitCode: Number.isInteger(exitCode) ? exitCode : 1,
        stdoutTail: typeof stdoutTail === 'string' && stdoutTail.trim().length > 0 ? stdoutTail : null,
        stderrTail: typeof stderrTail === 'string' && stderrTail.trim().length > 0 ? stderrTail : null,
    });
}

export function runOsSurfaceClickabilityProbe() {
    const grepPattern = buildPlaywrightGrepPattern(PROBED_TEST_NAMES);
    const startedAt = Date.now();
    const result = spawnSync(
        'npx',
        [
            'playwright',
            'test',
            'tests/e2e/uiux-template-generation.spec.js',
            '--workers=1',
            '--reporter=json',
            '-g',
            grepPattern,
        ],
        {
            cwd: process.cwd(),
            encoding: 'utf8',
            stdio: 'pipe',
        },
    );
    const durationMs = Date.now() - startedAt;

    const stdout = typeof result.stdout === 'string' ? result.stdout : '';
    const stderr = typeof result.stderr === 'string' ? result.stderr : '';
    const combined = `${stdout}\n${stderr}`;
    const interceptErrors = Array.from(combined.matchAll(/intercepts pointer events/gi)).length;
    const parsedReport = parseOsSurfaceClickabilityJsonReport(stdout);

    return normalizeOsSurfaceClickabilityProbeResult({
        runOk: result.status === 0,
        parsedReport,
        interceptErrors,
        durationMs,
        exitCode: result.status,
        stdoutTail: stdout.trim().split('\n').slice(-30).join('\n'),
        stderrTail: stderr.trim().split('\n').slice(-30).join('\n'),
    });
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isEntrypoint) {
    const result = runOsSurfaceClickabilityProbe();
    if (!result.ok) {
        console.error('[OsSurfaceClickabilityProbe] FAIL');
        console.error(JSON.stringify(result, null, 2));
        process.exit(1);
    }
    console.log('[OsSurfaceClickabilityProbe] OK');
    console.log(JSON.stringify(result));
}
