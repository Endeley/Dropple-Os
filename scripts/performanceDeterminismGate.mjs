import process from 'node:process';
import { validateFrameParity } from '../engine/evaluation/validateFrameParity.js';

function readNumber(name, fallback) {
    const raw = process.env[name];
    if (raw == null || raw === '') return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
}

export function computeStats(samples = []) {
    const values = samples
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value >= 0)
        .sort((left, right) => left - right);

    if (values.length === 0) {
        return Object.freeze({
            count: 0,
            minMs: 0,
            maxMs: 0,
            avgMs: 0,
            p95Ms: 0,
        });
    }

    const sum = values.reduce((acc, value) => acc + value, 0);
    const p95Index = Math.min(values.length - 1, Math.floor(0.95 * (values.length - 1)));

    return Object.freeze({
        count: values.length,
        minMs: values[0],
        maxMs: values[values.length - 1],
        avgMs: sum / values.length,
        p95Ms: values[p95Index],
    });
}

export function evaluatePerformanceBudget({
    stats,
    maxMsBudget,
    p95MsBudget,
} = {}) {
    const safeStats = stats ?? computeStats([]);
    const maxBudget = Number.isFinite(maxMsBudget) ? Number(maxMsBudget) : Number.POSITIVE_INFINITY;
    const p95Budget = Number.isFinite(p95MsBudget) ? Number(p95MsBudget) : Number.POSITIVE_INFINITY;

    const violations = [];
    if (safeStats.maxMs > maxBudget) {
        violations.push(`maxMs ${safeStats.maxMs.toFixed(3)} exceeded budget ${maxBudget.toFixed(3)}`);
    }
    if (safeStats.p95Ms > p95Budget) {
        violations.push(`p95Ms ${safeStats.p95Ms.toFixed(3)} exceeded budget ${p95Budget.toFixed(3)}`);
    }

    return Object.freeze({
        ok: violations.length === 0,
        violations: Object.freeze(violations),
    });
}

function runOnce({ fromMs, toMs, stepMs } = {}) {
    const start = process.hrtime.bigint();
    const result = validateFrameParity({ fromMs, toMs, stepMs });
    const end = process.hrtime.bigint();
    const elapsedMs = Number(end - start) / 1e6;
    return Object.freeze({ result, elapsedMs });
}

export function runPerformanceDeterminismGate({
    fromMs = readNumber('PERF_DETERMINISM_FROM_MS', 0),
    toMs = readNumber('PERF_DETERMINISM_TO_MS', 2000),
    stepMs = readNumber('PERF_DETERMINISM_STEP_MS', 33),
    iterations = readNumber('PERF_DETERMINISM_ITERATIONS', 8),
    maxMsBudget = readNumber('PERF_DETERMINISM_MAX_MS_BUDGET', 2500),
    p95MsBudget = readNumber('PERF_DETERMINISM_P95_MS_BUDGET', 1800),
} = {}) {
    const timings = [];
    let sampleCount = 0;

    for (let index = 0; index < iterations; index += 1) {
        const sample = runOnce({ fromMs, toMs, stepMs });
        sampleCount += Number(sample.result?.samples ?? 0);
        if (!sample.result?.ok) {
            return Object.freeze({
                ok: false,
                reason: 'determinism-mismatch',
                mismatches: sample.result?.mismatches ?? [],
                sampleCount,
                stats: computeStats(timings),
                budget: evaluatePerformanceBudget({
                    stats: computeStats(timings),
                    maxMsBudget,
                    p95MsBudget,
                }),
            });
        }
        timings.push(sample.elapsedMs);
    }

    const stats = computeStats(timings);
    const budget = evaluatePerformanceBudget({ stats, maxMsBudget, p95MsBudget });
    return Object.freeze({
        ok: budget.ok,
        reason: budget.ok ? 'ok' : 'budget-regression',
        mismatches: [],
        sampleCount,
        stats,
        budget,
    });
}

if (process.argv[1] && process.argv[1].endsWith('performanceDeterminismGate.mjs')) {
    const result = runPerformanceDeterminismGate();
    const stats = result.stats ?? computeStats([]);
    console.log(
        `[PerformanceDeterminismGate] samples=${stats.count} paritySamples=${result.sampleCount} minMs=${stats.minMs.toFixed(
            3,
        )} avgMs=${stats.avgMs.toFixed(3)} p95Ms=${stats.p95Ms.toFixed(3)} maxMs=${stats.maxMs.toFixed(3)}`,
    );

    if (result.ok) {
        console.log('[PerformanceDeterminismGate] OK');
        process.exit(0);
    }

    console.error(`[PerformanceDeterminismGate] FAIL reason=${result.reason}`);
    for (const violation of result.budget?.violations ?? []) {
        console.error(`[PerformanceDeterminismGate] ${violation}`);
    }
    if (Array.isArray(result.mismatches) && result.mismatches.length > 0) {
        const mismatch = result.mismatches[0];
        console.error(
            `[PerformanceDeterminismGate] first-mismatch timeMs=${mismatch?.timeMs} headless=${mismatch?.headlessHash} live=${mismatch?.liveHash}`,
        );
    }
    process.exit(1);
}
