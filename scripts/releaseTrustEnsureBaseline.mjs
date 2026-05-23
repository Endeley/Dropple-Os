import fs from 'node:fs';
import path from 'node:path';
import { captureReleaseTrustBaseline } from './releaseTrustCaptureBaseline.mjs';

function parseUtcTimestamp(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const parsed = Date.parse(value.trim());
    if (!Number.isFinite(parsed)) return null;
    return parsed;
}

function hasFile(filePath) {
    return fs.existsSync(path.resolve(filePath));
}

export function ensureReleaseTrustBaseline({
    currentReportPath = process.env.RELEASE_TRUST_CURRENT_PATH || '.artifacts/release-trust.json',
    baselineReportPath = process.env.RELEASE_TRUST_BASELINE_PATH || '.artifacts/release-trust-baseline.json',
    currentProbePath = process.env.RELEASE_TRUST_UI_PROBE_PATH || '.artifacts/os-surface-clickability-probe.json',
    baselineProbePath =
        process.env.RELEASE_TRUST_UI_PROBE_BASELINE_PATH || '.artifacts/os-surface-clickability-probe-baseline.json',
    baselineRequiredAfter = process.env.RELEASE_TRUST_BASELINE_REQUIRED_AFTER || null,
    nowMs = Date.now(),
} = {}) {
    const baselineReportExists = hasFile(baselineReportPath);
    const baselineProbeExists = hasFile(baselineProbePath);
    const baselinePresent = baselineReportExists || baselineProbeExists;

    if (baselinePresent) {
        return Object.freeze({
            ok: true,
            enforced: false,
            baselinePresent: true,
            action: 'noop',
            reason: 'baseline-present',
            warning: null,
            capture: null,
        });
    }

    const capture = captureReleaseTrustBaseline({
        currentReportPath,
        baselineReportPath,
        currentProbePath,
        baselineProbePath,
    });

    if (capture.ok === true) {
        return Object.freeze({
            ok: true,
            enforced: false,
            baselinePresent: true,
            action: 'captured',
            reason: 'captured-from-current',
            warning: null,
            capture,
        });
    }

    const cutoffMs = parseUtcTimestamp(baselineRequiredAfter);
    const enforcementActive = cutoffMs !== null && Number.isFinite(nowMs) && Number(nowMs) >= cutoffMs;
    if (enforcementActive) {
        return Object.freeze({
            ok: false,
            enforced: true,
            baselinePresent: false,
            action: 'missing',
            reason: 'baseline-required-after-cutoff',
            warning: null,
            capture,
        });
    }

    return Object.freeze({
        ok: true,
        enforced: false,
        baselinePresent: false,
        action: 'missing',
        reason: 'baseline-unavailable-pre-cutoff',
        warning: 'baseline unavailable; continuing pre-cutoff.',
        capture,
    });
}

if (process.argv[1] && process.argv[1].endsWith('releaseTrustEnsureBaseline.mjs')) {
    const result = ensureReleaseTrustBaseline();

    if (result.action === 'captured') {
        console.log('[ReleaseTrustBaselineEnsure] baseline captured from current artifacts.');
    } else if (result.action === 'noop') {
        console.log('[ReleaseTrustBaselineEnsure] baseline already present.');
    } else if (result.warning) {
        console.log(`[ReleaseTrustBaselineEnsure] WARN ${result.warning}`);
    }

    if (!result.ok) {
        console.error(
            '[ReleaseTrustBaselineEnsure] ERROR baseline is required after cutoff and no current artifacts were available.',
        );
        process.exit(1);
    }
}
