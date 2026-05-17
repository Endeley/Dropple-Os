import fs from 'node:fs';
import { runReleaseTrustDiff } from './releaseTrustDiff.mjs';

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

export function formatReleaseTrustSummary({
    result,
    strict = false,
    baselineRequiredAfter = null,
} = {}) {
    const safeResult = result ?? { ok: false, errors: ['release trust diff result unavailable.'], warnings: [], deltas: [], outcomes: [] };
    const grouped = groupOutcomes(safeResult.outcomes ?? []);
    const lines = [];

    lines.push('## Release Trust Diff Summary');
    lines.push('');
    lines.push(`- Status: **${safeResult.ok ? 'PASS' : 'FAIL'}**`);
    lines.push(`- Strict mode: \`${strict ? 'true' : 'false'}\``);
    lines.push(`- Baseline required after: \`${baselineRequiredAfter ?? 'not-set'}\``);
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

export function buildReleaseTrustSummary({
    currentPath = process.env.RELEASE_TRUST_CURRENT_PATH || '.artifacts/release-trust.json',
    baselinePath = process.env.RELEASE_TRUST_BASELINE_PATH || '.artifacts/release-trust-baseline.json',
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
    return formatReleaseTrustSummary({
        result,
        strict: strictEnabled,
        baselineRequiredAfter,
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

