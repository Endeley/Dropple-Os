import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_CHECK_IDS = Object.freeze([
    'architectureGate',
    'exportVerification',
    'federationAttestation',
    'simulationTrace',
]);

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseVersion(value) {
    if (typeof value !== 'string') return null;
    const match = value.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) return null;
    return match.slice(1).map((part) => Number(part));
}

function compareVersions(left, right) {
    const a = parseVersion(left);
    const b = parseVersion(right);
    if (!a || !b) return 0;
    for (let index = 0; index < 3; index += 1) {
        if (a[index] > b[index]) return 1;
        if (a[index] < b[index]) return -1;
    }
    return 0;
}

function readJsonFile(filePath) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) return null;
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function resolveCheckSet(report) {
    if (!isPlainObject(report?.checks)) return new Set();
    return new Set(Object.keys(report.checks));
}

export function diffReleaseTrustReports({ current, baseline }) {
    const errors = [];
    const warnings = [];
    const deltas = [];

    if (!isPlainObject(current)) {
        errors.push('current report is missing or invalid.');
        return Object.freeze({ ok: false, errors, warnings, deltas });
    }

    if (!isPlainObject(baseline)) {
        warnings.push('baseline report unavailable; diff skipped.');
        return Object.freeze({ ok: true, errors, warnings, deltas });
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
    for (const checkId of REQUIRED_CHECK_IDS) {
        if (baselineChecks.has(checkId) && !currentChecks.has(checkId)) {
            errors.push(`required check disappeared: ${checkId}`);
        }
    }

    const commonChecks = [...baselineChecks].filter((checkId) => currentChecks.has(checkId));
    for (const checkId of commonChecks.sort((left, right) => left.localeCompare(right))) {
        const baselineCheck = baseline.checks[checkId];
        const currentCheck = current.checks[checkId];
        const baselineHash = JSON.stringify(baselineCheck);
        const currentHash = JSON.stringify(currentCheck);
        if (baselineHash !== currentHash) {
            deltas.push(`check changed: ${checkId}`);
        }
    }

    return Object.freeze({
        ok: errors.length === 0,
        errors: Object.freeze(errors),
        warnings: Object.freeze(warnings),
        deltas: Object.freeze(deltas),
    });
}

export function runReleaseTrustDiff({
    currentPath = '.artifacts/release-trust.json',
    baselinePath = '.artifacts/release-trust-baseline.json',
} = {}) {
    const current = readJsonFile(currentPath);
    const baseline = readJsonFile(baselinePath);
    return diffReleaseTrustReports({ current, baseline });
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
    if (!result.ok) {
        for (const error of result.errors) {
            console.error(`[ReleaseTrustDiff] ERROR ${error}`);
        }
        process.exit(1);
    }
    console.log('[ReleaseTrustDiff] OK');
}
