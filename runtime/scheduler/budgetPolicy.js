function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

export const SCHEDULER_BUDGET_POLICIES = Object.freeze({
    ALL_REMAINING: 'all-remaining',
    FIXED: 'fixed',
});

export function normalizeSchedulerBudgetPolicy(policy = null) {
    const value = String(policy ?? '').trim().toLowerCase();
    return value === SCHEDULER_BUDGET_POLICIES.FIXED
        ? SCHEDULER_BUDGET_POLICIES.FIXED
        : SCHEDULER_BUDGET_POLICIES.ALL_REMAINING;
}

export function resolveSchedulerPartitionBudget({
    remainingPartitionCount = 0,
    requestedBudget = null,
    policy = null,
} = {}) {
    const remaining = Math.max(0, Math.floor(toFiniteNumber(remainingPartitionCount, 0)));
    const normalizedPolicy = normalizeSchedulerBudgetPolicy(policy);

    if (normalizedPolicy === SCHEDULER_BUDGET_POLICIES.FIXED) {
        const fixedBudget = Math.max(0, Math.floor(toFiniteNumber(requestedBudget, 0)));
        return Object.freeze({
            policy: normalizedPolicy,
            budget: Math.min(remaining, fixedBudget),
            code: 'scheduler-budget-fixed-bounded',
        });
    }

    return Object.freeze({
        policy: SCHEDULER_BUDGET_POLICIES.ALL_REMAINING,
        budget: remaining,
        code: 'scheduler-budget-all-remaining',
    });
}
