import fs from 'node:fs';
import path from 'node:path';

function copyIfExists(sourcePath, targetPath) {
    const sourceAbsolute = path.resolve(sourcePath);
    if (!fs.existsSync(sourceAbsolute)) {
        return Object.freeze({ copied: false, reason: 'missing-source', sourcePath, targetPath });
    }
    const targetAbsolute = path.resolve(targetPath);
    fs.mkdirSync(path.dirname(targetAbsolute), { recursive: true });
    fs.copyFileSync(sourceAbsolute, targetAbsolute);
    return Object.freeze({ copied: true, reason: null, sourcePath, targetPath });
}

export function captureReleaseTrustBaseline({
    currentReportPath = process.env.RELEASE_TRUST_CURRENT_PATH || '.artifacts/release-trust.json',
    baselineReportPath = process.env.RELEASE_TRUST_BASELINE_PATH || '.artifacts/release-trust-baseline.json',
    currentProbePath = process.env.RELEASE_TRUST_UI_PROBE_PATH || '.artifacts/os-surface-clickability-probe.json',
    baselineProbePath =
        process.env.RELEASE_TRUST_UI_PROBE_BASELINE_PATH || '.artifacts/os-surface-clickability-probe-baseline.json',
} = {}) {
    const report = copyIfExists(currentReportPath, baselineReportPath);
    const probe = copyIfExists(currentProbePath, baselineProbePath);
    return Object.freeze({
        ok: report.copied === true || probe.copied === true,
        report,
        probe,
    });
}

if (process.argv[1] && process.argv[1].endsWith('releaseTrustCaptureBaseline.mjs')) {
    const result = captureReleaseTrustBaseline();
    if (result.report.copied) {
        console.log(`[ReleaseTrustBaselineCapture] report => ${result.report.targetPath}`);
    } else {
        console.log(`[ReleaseTrustBaselineCapture] report skipped (${result.report.reason})`);
    }
    if (result.probe.copied) {
        console.log(`[ReleaseTrustBaselineCapture] probe => ${result.probe.targetPath}`);
    } else {
        console.log(`[ReleaseTrustBaselineCapture] probe skipped (${result.probe.reason})`);
    }
    if (!result.ok) {
        console.log('[ReleaseTrustBaselineCapture] no current artifacts found to capture');
    }
}
