import test from 'node:test';
import assert from 'node:assert/strict';
import {
    computeStats,
    evaluatePerformanceBudget,
} from '@/scripts/performanceDeterminismGate.mjs';

test('computeStats returns deterministic aggregates and p95', () => {
    const stats = computeStats([40, 10, 20, 30, 50]);
    assert.deepEqual(stats, {
        count: 5,
        minMs: 10,
        maxMs: 50,
        avgMs: 30,
        p95Ms: 40,
    });
});

test('evaluatePerformanceBudget passes when within max and p95 budgets', () => {
    const stats = computeStats([18, 20, 22, 24, 26]);
    const budget = evaluatePerformanceBudget({
        stats,
        maxMsBudget: 30,
        p95MsBudget: 26,
    });
    assert.equal(budget.ok, true);
    assert.deepEqual(budget.violations, []);
});

test('evaluatePerformanceBudget reports deterministic violations when budgets regress', () => {
    const stats = computeStats([100, 110, 120, 130, 140]);
    const budget = evaluatePerformanceBudget({
        stats,
        maxMsBudget: 125,
        p95MsBudget: 120,
    });
    assert.equal(budget.ok, false);
    assert.equal(budget.violations.some((entry) => entry.includes('maxMs')), true);
    assert.equal(budget.violations.some((entry) => entry.includes('p95Ms')), true);
});
