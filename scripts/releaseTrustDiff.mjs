import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    compareReleaseTrustChecks,
    RELEASE_TRUST_REQUIRED_CHECK_IDS,
} from './releaseTrustComparators/index.mjs';
import {
    compareVersions,
    isPlainObject,
} from './releaseTrustComparators/common.mjs';

function readJsonFile(filePath) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) return null;
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function parseUtcTimestamp(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const parsed = Date.parse(value.trim());
    if (!Number.isFinite(parsed)) return null;
    return parsed;
}

function resolveCheckSet(report) {
    if (!isPlainObject(report?.checks)) return new Set();
    return new Set(Object.keys(report.checks));
}

function parseStrictFlag(value) {
    if (typeof value !== 'string') return false;
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export function diffReleaseTrustReports({
    current,
    baseline,
    nowMs = Date.now(),
    baselineRequiredAfter = null,
    strict = false,
}) {
    const errors = [];
    const warnings = [];
    const deltas = [];
    const outcomes = [];

    if (!isPlainObject(current)) {
        errors.push('current report is missing or invalid.');
        return Object.freeze({ ok: false, errors, warnings, deltas, outcomes });
    }

    if (!isPlainObject(baseline)) {
        const cutoffMs = parseUtcTimestamp(baselineRequiredAfter);
        if (cutoffMs !== null && Number.isFinite(nowMs) && Number(nowMs) >= cutoffMs) {
            errors.push(
                `baseline report unavailable after enforcement cutoff (${baselineRequiredAfter}).`,
            );
            return Object.freeze({ ok: false, errors, warnings, deltas, outcomes });
        }

        warnings.push('baseline report unavailable; diff skipped.');
        return Object.freeze({ ok: true, errors, warnings, deltas, outcomes });
    }

    const versionComparison = compareVersions(current.schemaVersion, baseline.schemaVersion);
    if (versionComparison < 0) {
        errors.push(
            `schema version downgraded: baseline=${baseline.schemaVersion} current=${current.schemaVersion}`,
        );
    } else if (versionComparison > 0) {
        deltas.push(`schema version changed: ${baseline.schemaVersion} -> ${current.schemaVersion}`);
    }

    const currentChecks = resolveCheckSet(current);
    const baselineChecks = resolveCheckSet(baseline);
    for (const checkId of RELEASE_TRUST_REQUIRED_CHECK_IDS) {
        if (baselineChecks.has(checkId) && !currentChecks.has(checkId)) {
            errors.push(`required check disappeared: ${checkId}`);
        }
    }

    outcomes.push(
        ...compareReleaseTrustChecks({
            baselineChecks: baseline.checks ?? {},
            currentChecks: current.checks ?? {},
            strict,
        }),
    );

    for (const outcome of outcomes) {
        if (outcome.ok !== true) {
            errors.push(`${outcome.invariant}: ${outcome.message}`);
            continue;
        }
        if (outcome.severity === 'warning') {
            deltas.push(`${outcome.invariant}: ${outcome.message}`);
        }
    }

    return Object.freeze({
        ok: errors.length === 0,
        errors: Object.freeze(errors),
        warnings: Object.freeze(warnings),
        deltas: Object.freeze(deltas),
        outcomes: Object.freeze(outcomes),
    });
}

export function runReleaseTrustDiff({
    currentPath = '.artifacts/release-trust.json',
    baselinePath = '.artifacts/release-trust-baseline.json',
    nowMs = Date.now(),
    baselineRequiredAfter = process.env.RELEASE_TRUST_BASELINE_REQUIRED_AFTER || null,
    strict = parseStrictFlag(process.env.RELEASE_TRUST_DIFF_STRICT || 'false'),
} = {}) {
    const current = readJsonFile(currentPath);
    const baseline = readJsonFile(baselinePath);
    return diffReleaseTrustReports({
        current,
        baseline,
        nowMs,
        baselineRequiredAfter,
        strict,
    });
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const result = runReleaseTrustDiff({
        currentPath: process.env.RELEASE_TRUST_CURRENT_PATH || '.artifacts/release-trust.json',
        baselinePath: process.env.RELEASE_TRUST_BASELINE_PATH || '.artifacts/release-trust-baseline.json',
    });

    for (const warning of result.warnings) {
        console.log(`[ReleaseTrustDiff] WARN ${warning}`);
    }
    for (const delta of result.deltas) {
        console.log(`[ReleaseTrustDiff] DELTA ${delta}`);
    }
    for (const outcome of result.outcomes ?? []) {
        console.log(
            `[ReleaseTrustDiff] OUTCOME severity=${outcome.severity} classification=${outcome.classification} invariant=${outcome.invariant} message=${outcome.message}`,
        );
    }
    if (!result.ok) {
        for (const error of result.errors) {
            console.error(`[ReleaseTrustDiff] ERROR ${error}`);
        }
        process.exit(1);
    }
    console.log('[ReleaseTrustDiff] OK');
}
