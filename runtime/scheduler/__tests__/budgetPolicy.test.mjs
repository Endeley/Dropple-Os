import test from 'node:test';
import assert from 'node:assert/strict';

import {
    SCHEDULER_BUDGET_POLICIES,
    normalizeSchedulerBudgetPolicy,
    resolveSchedulerPartitionBudget,
} from '@/runtime/scheduler/budgetPolicy.js';

test('normalizeSchedulerBudgetPolicy is deterministic and fail-closed', () => {
    assert.equal(normalizeSchedulerBudgetPolicy('fixed'), SCHEDULER_BUDGET_POLICIES.FIXED);
    assert.equal(normalizeSchedulerBudgetPolicy('FIXED'), SCHEDULER_BUDGET_POLICIES.FIXED);
    assert.equal(normalizeSchedulerBudgetPolicy('unknown'), SCHEDULER_BUDGET_POLICIES.ALL_REMAINING);
});

test('resolveSchedulerPartitionBudget defaults to all remaining', () => {
    const resolution = resolveSchedulerPartitionBudget({
        remainingPartitionCount: 4,
    });

    assert.equal(resolution.policy, SCHEDULER_BUDGET_POLICIES.ALL_REMAINING);
    assert.equal(resolution.budget, 4);
    assert.equal(resolution.code, 'scheduler-budget-all-remaining');
});

test('resolveSchedulerPartitionBudget clamps fixed budget to remaining count', () => {
    const resolution = resolveSchedulerPartitionBudget({
        remainingPartitionCount: 2,
        requestedBudget: 99,
        policy: SCHEDULER_BUDGET_POLICIES.FIXED,
    });

    assert.equal(resolution.policy, SCHEDULER_BUDGET_POLICIES.FIXED);
    assert.equal(resolution.budget, 2);
    assert.equal(resolution.code, 'scheduler-budget-fixed-bounded');
});
