import fs from 'node:fs';
import { runReleaseTrustDiff } from './releaseTrustDiff.mjs';
import { parseLedgerLines, verifyLedgerChain } from './releaseTrustLedger.mjs';

function groupOutcomes(outcomes = []) {
    const groups = {
        error: [],
        warning: [],
        info: [],
    };
    for (const outcome of outcomes) {
        const key = outcome?.severity === 'error' ? 'error' : outcome?.severity === 'warning' ? 'warning' : 'info';
        groups[key].push(outcome);
    }
    return groups;
}

function readJsonOrNull(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

export function formatReleaseTrustSummary({
    result,
    strict = false,
    baselineRequiredAfter = null,
    ledger = null,
    federationLineage = null,
    federationLineageLedger = null,
    osSurfaceProbeCurrent = null,
    osSurfaceProbeBaseline = null,
} = {}) {
    const safeResult = result ?? { ok: false, errors: ['release trust diff result unavailable.'], warnings: [], deltas: [], outcomes: [] };
    const grouped = groupOutcomes(safeResult.outcomes ?? []);
    const lines = [];

    lines.push('## Release Trust Diff Summary');
    lines.push('');
    lines.push(`- Status: **${safeResult.ok ? 'PASS' : 'FAIL'}**`);
    lines.push(`- Strict mode: \`${strict ? 'true' : 'false'}\``);
    lines.push(`- Baseline required after: \`${baselineRequiredAfter ?? 'not-set'}\``);
    if (ledger) {
        lines.push(`- Ledger entries: \`${Number(ledger.entryCount ?? 0)}\``);
        lines.push(`- Ledger chain: \`${ledger.ok ? 'ok' : 'fail'}\``);
        if (!ledger.ok && ledger.reason) {
            lines.push(`- Ledger issue: \`${ledger.reason}\` (index=${Number(ledger.index ?? -1)})`);
        }
    }
    if (federationLineage) {
        lines.push(`- Federation lineage hash: \`${federationLineage.lineageHash || 'missing'}\``);
        lines.push(`- Federation tamper rejected: \`${federationLineage.tamperRejected ? 'true' : 'false'}\``);
        lines.push(`- Federation replay equivalent: \`${federationLineage.replayEquivalent ? 'true' : 'false'}\``);
        lines.push(`- Federation stale rejected: \`${federationLineage.staleRejected ? 'true' : 'false'}\``);
        lines.push(`- Federation ordering closed: \`${federationLineage.orderingClosed ? 'true' : 'false'}\``);
    }
    if (federationLineageLedger) {
        lines.push(`- Federation lineage ledger entries: \`${Number(federationLineageLedger.entryCount ?? 0)}\``);
        lines.push(`- Federation lineage ledger chain: \`${federationLineageLedger.ok ? 'ok' : 'fail'}\``);
        if (!federationLineageLedger.ok && federationLineageLedger.reason) {
            lines.push(
                `- Federation lineage ledger issue: \`${federationLineageLedger.reason}\` (index=${Number(
                    federationLineageLedger.index ?? -1,
                )})`,
            );
        }
    }
    if (osSurfaceProbeCurrent) {
        const durationOutcome = (safeResult.outcomes ?? []).find(
            (entry) => entry?.invariant === 'osSurfaceShellRuntimeProbe.duration-regression',
        );
        const currentDuration = Number.isFinite(osSurfaceProbeCurrent.durationMs)
            ? Number(osSurfaceProbeCurrent.durationMs)
            : 0;
        const baselineDuration = Number.isFinite(osSurfaceProbeBaseline?.durationMs)
            ? Number(osSurfaceProbeBaseline.durationMs)
            : null;
        const regressionPct =
            baselineDuration && baselineDuration > 0
                ? (((currentDuration - baselineDuration) / baselineDuration) * 100)
                : null;

        lines.push('### OS Surface Probe');
        lines.push(`- Publish clickable: \`${osSurfaceProbeCurrent.publishClickable ? 'true' : 'false'}\``);
        lines.push(`- Keyframe clickable: \`${osSurfaceProbeCurrent.keyframeClickable ? 'true' : 'false'}\``);
        lines.push(`- Pointer intercept errors: \`${Number(osSurfaceProbeCurrent.interceptErrors ?? 0)}\``);
        lines.push(`- Duration (current): \`${currentDuration}ms\``);
        if (baselineDuration !== null) {
            lines.push(`- Duration (baseline): \`${baselineDuration}ms\``);
        }
        if (regressionPct !== null) {
            lines.push(`- Duration delta: \`${regressionPct >= 0 ? '+' : ''}${regressionPct.toFixed(1)}%\``);
        }
        if (durationOutcome?.severity === 'warning') {
            lines.push(`- Duration status: \`WARN\` (${durationOutcome.message})`);
        } else {
            lines.push('- Duration status: `OK`');
        }
        lines.push('');
    }
    lines.push('');

    if ((safeResult.errors ?? []).length > 0) {
        lines.push('### Constitutional Regressions');
        for (const error of safeResult.errors) {
            lines.push(`- ❌ ${error}`);
        }
        lines.push('');
    }

    if ((safeResult.warnings ?? []).length > 0) {
        lines.push('### Warnings');
        for (const warning of safeResult.warnings) {
            lines.push(`- ⚠️ ${warning}`);
        }
        lines.push('');
    }

    if ((safeResult.deltas ?? []).length > 0) {
        lines.push('### Semantic Drift');
        for (const delta of safeResult.deltas) {
            lines.push(`- 🟡 ${delta}`);
        }
        lines.push('');
    }

    if (grouped.info.length > 0) {
        lines.push('### Lawful Evolution');
        for (const outcome of grouped.info) {
            lines.push(`- ✅ ${outcome.invariant}: ${outcome.message}`);
        }
        lines.push('');
    }

    return `${lines.join('\n').trim()}\n`;
}

function resolveLedgerStatus(ledgerPath) {
    if (!ledgerPath || !fs.existsSync(ledgerPath)) {
        return Object.freeze({
            ok: true,
            entryCount: 0,
            reason: null,
            index: null,
        });
    }
    const content = fs.readFileSync(ledgerPath, 'utf8');
    const entries = parseLedgerLines(content);
    const verification = verifyLedgerChain(entries);
    if (!verification.ok) {
        return Object.freeze({
            ok: false,
            entryCount: entries.length,
            reason: verification.reason ?? 'unknown',
            index: Number.isInteger(verification.index) ? verification.index : null,
        });
    }
    return Object.freeze({
        ok: true,
        entryCount: entries.length,
        reason: null,
        index: null,
    });
}

function resolveFederationLineageStatus(lineagePath) {
    if (!lineagePath || !fs.existsSync(lineagePath)) return null;
    try {
        const payload = JSON.parse(fs.readFileSync(lineagePath, 'utf8'));
        return Object.freeze({
            lineageHash: String(payload?.lineageHash ?? ''),
            tamperRejected: payload?.tamperRejected === true,
            replayEquivalent: payload?.replayEquivalent === true,
            staleRejected: payload?.staleRejected === true,
            orderingClosed: payload?.orderingClosed === true,
        });
    } catch {
        return Object.freeze({
            lineageHash: '',
            tamperRejected: false,
            replayEquivalent: false,
            staleRejected: false,
            orderingClosed: false,
        });
    }
}

function resolveFederationLineageLedgerStatus(ledgerPath) {
    if (!ledgerPath || !fs.existsSync(ledgerPath)) {
        return Object.freeze({
            ok: true,
            entryCount: 0,
            reason: null,
            index: null,
        });
    }
    const content = fs.readFileSync(ledgerPath, 'utf8');
    const entries = parseLedgerLines(content);
    const verification = verifyLedgerChain(entries);
    if (!verification.ok) {
        return Object.freeze({
            ok: false,
            entryCount: entries.length,
            reason: verification.reason ?? 'unknown',
            index: Number.isInteger(verification.index) ? verification.index : null,
        });
    }
    return Object.freeze({
        ok: true,
        entryCount: entries.length,
        reason: null,
        index: null,
    });
}

export function buildReleaseTrustSummary({
    currentPath = process.env.RELEASE_TRUST_CURRENT_PATH || '.artifacts/release-trust.json',
    baselinePath = process.env.RELEASE_TRUST_BASELINE_PATH || '.artifacts/release-trust-baseline.json',
    ledgerPath = process.env.RELEASE_TRUST_LEDGER_PATH || '.artifacts/release-trust-ledger.jsonl',
    federationLineagePath = process.env.FEDERATION_AUDIT_LINEAGE_PATH || '.artifacts/federation-audit-lineage.json',
    federationLineageLedgerPath =
        process.env.FEDERATION_AUDIT_LINEAGE_LEDGER_PATH || '.artifacts/federation-audit-lineage-ledger.jsonl',
    baselineRequiredAfter = process.env.RELEASE_TRUST_BASELINE_REQUIRED_AFTER || null,
    strict = process.env.RELEASE_TRUST_DIFF_STRICT || 'false',
} = {}) {
    const strictEnabled = ['1', 'true', 'yes', 'on'].includes(String(strict).trim().toLowerCase());
    const result = runReleaseTrustDiff({
        currentPath,
        baselinePath,
        baselineRequiredAfter,
        strict: strictEnabled,
    });
    const currentReport = readJsonOrNull(currentPath);
    const baselineReport = readJsonOrNull(baselinePath);
    return formatReleaseTrustSummary({
        result,
        strict: strictEnabled,
        baselineRequiredAfter,
        ledger: resolveLedgerStatus(ledgerPath),
        federationLineage: resolveFederationLineageStatus(federationLineagePath),
        federationLineageLedger: resolveFederationLineageLedgerStatus(federationLineageLedgerPath),
        osSurfaceProbeCurrent: currentReport?.checks?.osSurfaceShellRuntimeProbe ?? null,
        osSurfaceProbeBaseline: baselineReport?.checks?.osSurfaceShellRuntimeProbe ?? null,
    });
}

if (process.argv[1] && process.argv[1].endsWith('releaseTrustSummary.mjs')) {
    const summary = buildReleaseTrustSummary();
    process.stdout.write(summary);
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (summaryPath && summaryPath.trim()) {
        fs.appendFileSync(summaryPath, `${summary}\n`, 'utf8');
    }
}
