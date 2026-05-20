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

function resolveDurationTrend({
    currentDuration,
    baselineDuration,
} = {}) {
    if (!Number.isFinite(currentDuration) || !Number.isFinite(baselineDuration) || Number(baselineDuration) <= 0) {
        return null;
    }
    const ratio = Number(currentDuration) / Number(baselineDuration);
    const deltaPercent = ((Number(currentDuration) - Number(baselineDuration)) / Number(baselineDuration)) * 100;
    let trend = 'stable';
    if (deltaPercent > 5) trend = 'regressed';
    if (deltaPercent < -5) trend = 'improved';
    return Object.freeze({
        regression: ratio > 1.4,
        trend,
        baselineDuration: Number(baselineDuration),
        currentDuration: Number(currentDuration),
        percent: deltaPercent,
    });
}

export function formatReleaseTrustProbeSummary({
    probe,
    report,
    baselineProbe = null,
} = {}) {
    if (!probe?.check || typeof probe.check !== 'object') {
        return '[ReleaseTrustProbeSummary] status=missing-probe payload';
    }
    const check = probe.check;
    const baselineFromReport = readReport(
        process.env.RELEASE_TRUST_BASELINE_PATH || '.artifacts/release-trust-baseline.json',
    )?.checks?.osSurfaceShellRuntimeProbe?.durationMs;
    const baselineFromProbe = baselineProbe?.check?.durationMs;
    const baselineDuration = Number.isFinite(baselineFromProbe)
        ? Number(baselineFromProbe)
        : Number.isFinite(baselineFromReport)
            ? Number(baselineFromReport)
            : null;
    const trend = resolveDurationTrend({
        currentDuration: check.durationMs,
        baselineDuration,
    });
    const status = check.ok === true ? 'PASS' : 'FAIL';
    const durationStatus = trend?.regression ? 'WARN' : 'OK';
    const deltaText = trend ? `${trend.percent >= 0 ? '+' : ''}${trend.percent.toFixed(1)}%` : 'n/a';
    const trendText = trend?.trend ?? 'unknown';

    return [
        `[ReleaseTrustProbeSummary] status=${status}`,
        `failureReason=${check.reason ?? 'none'}`,
        `publishClickable=${check.publishClickable === true}`,
        `keyframeClickable=${check.keyframeClickable === true}`,
        `interceptErrors=${Number.isFinite(check.interceptErrors) ? Number(check.interceptErrors) : 0}`,
        `durationMs=${Number.isFinite(check.durationMs) ? Number(check.durationMs) : 0}`,
        `baselineDurationMs=${Number.isFinite(baselineDuration) ? Number(baselineDuration) : 'n/a'}`,
        `durationDeltaPct=${deltaText}`,
        `trend=${trendText}`,
        `durationStatus=${durationStatus}`,
    ].join(' ');
}

export function runReleaseTrustProbeSummary({
    probePath = process.env.RELEASE_TRUST_UI_PROBE_PATH || '.artifacts/os-surface-clickability-probe.json',
    baselineProbePath =
        process.env.RELEASE_TRUST_UI_PROBE_BASELINE_PATH || '.artifacts/os-surface-clickability-probe-baseline.json',
    reportPath = process.env.RELEASE_TRUST_CURRENT_PATH || '.artifacts/release-trust.json',
    stepSummaryPath = process.env.GITHUB_STEP_SUMMARY || '',
} = {}) {
    const probe = readProbeArtifact(probePath);
    const baselineProbe = readProbeArtifact(baselineProbePath);
    const report = readReport(reportPath);
    const line = formatReleaseTrustProbeSummary({ probe, report, baselineProbe });

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
