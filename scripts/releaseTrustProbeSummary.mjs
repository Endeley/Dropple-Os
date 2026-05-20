import fs from 'node:fs';

function readProbeArtifact(probePath) {
    if (!probePath || !fs.existsSync(probePath)) {
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(probePath, 'utf8'));
    } catch {
        return null;
    }
}

function readReport(reportPath) {
    if (!reportPath || !fs.existsSync(reportPath)) return null;
    try {
        return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch {
        return null;
    }
}

function findDurationRegressionOutcome(report) {
    const baselinePath = process.env.RELEASE_TRUST_BASELINE_PATH || '.artifacts/release-trust-baseline.json';
    const baseline = readReport(baselinePath);
    const currentDuration = report?.checks?.osSurfaceShellRuntimeProbe?.durationMs;
    const baselineDuration = baseline?.checks?.osSurfaceShellRuntimeProbe?.durationMs;
    if (!Number.isFinite(currentDuration) || !Number.isFinite(baselineDuration) || Number(baselineDuration) <= 0) {
        return null;
    }
    const ratio = Number(currentDuration) / Number(baselineDuration);
    const regression = ratio > 1.4;
    return Object.freeze({
        regression,
        baselineDuration: Number(baselineDuration),
        currentDuration: Number(currentDuration),
        percent: ((Number(currentDuration) - Number(baselineDuration)) / Number(baselineDuration)) * 100,
    });
}

export function formatReleaseTrustProbeSummary({
    probe,
    report,
} = {}) {
    if (!probe?.check || typeof probe.check !== 'object') {
        return '[ReleaseTrustProbeSummary] status=missing-probe payload';
    }
    const check = probe.check;
    const regression = findDurationRegressionOutcome(report);
    const status = check.ok === true ? 'PASS' : 'FAIL';
    const durationStatus = regression?.regression ? 'WARN' : 'OK';
    const deltaText = regression ? `${regression.percent >= 0 ? '+' : ''}${regression.percent.toFixed(1)}%` : 'n/a';

    return [
        `[ReleaseTrustProbeSummary] status=${status}`,
        `publishClickable=${check.publishClickable === true}`,
        `keyframeClickable=${check.keyframeClickable === true}`,
        `interceptErrors=${Number.isFinite(check.interceptErrors) ? Number(check.interceptErrors) : 0}`,
        `durationMs=${Number.isFinite(check.durationMs) ? Number(check.durationMs) : 0}`,
        `durationStatus=${durationStatus}`,
        `durationDelta=${deltaText}`,
    ].join(' ');
}

export function runReleaseTrustProbeSummary({
    probePath = process.env.RELEASE_TRUST_UI_PROBE_PATH || '.artifacts/os-surface-clickability-probe.json',
    reportPath = process.env.RELEASE_TRUST_CURRENT_PATH || '.artifacts/release-trust.json',
    stepSummaryPath = process.env.GITHUB_STEP_SUMMARY || '',
} = {}) {
    const probe = readProbeArtifact(probePath);
    const report = readReport(reportPath);
    const line = formatReleaseTrustProbeSummary({ probe, report });

    console.log(line);
    if (stepSummaryPath && String(stepSummaryPath).trim()) {
        fs.appendFileSync(stepSummaryPath, `\n${line}\n`, 'utf8');
    }

    return Object.freeze({
        ok: true,
        line,
    });
}

if (process.argv[1] && process.argv[1].endsWith('releaseTrustProbeSummary.mjs')) {
    runReleaseTrustProbeSummary();
}
