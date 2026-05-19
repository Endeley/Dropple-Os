import { createOutcome, isPlainObject } from './common.mjs';

export function compareOsSurfaceIntentRouting({
    baseline,
    current,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'osSurfaceIntentRouting.presence',
            classification: 'constitutional-regression',
            message: 'os surface intent routing check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    const routingOk = current.ok === true;
    outcomes.push(createOutcome({
        ok: routingOk,
        severity: routingOk ? 'info' : 'error',
        invariant: 'osSurfaceIntentRouting.ok',
        classification: routingOk ? 'lawful-evolution' : 'constitutional-regression',
        message: routingOk
            ? 'os surface intent-routing matrix remains valid.'
            : 'os surface intent-routing matrix failed.',
    }));

    const mutationFree = current.mutationFree === true;
    outcomes.push(createOutcome({
        ok: mutationFree,
        severity: mutationFree ? 'info' : 'error',
        invariant: 'osSurfaceIntentRouting.mutationFree',
        classification: mutationFree ? 'lawful-evolution' : 'constitutional-regression',
        message: mutationFree
            ? 'os surface routing remains coordination-only and mutation-free.'
            : 'os surface routing mutated runtime truth.',
    }));

    const acceptedCountValid = Number.isFinite(current.acceptedCount) && Number(current.acceptedCount) >= 1;
    outcomes.push(createOutcome({
        ok: acceptedCountValid,
        severity: acceptedCountValid ? 'info' : 'error',
        invariant: 'osSurfaceIntentRouting.acceptedCount',
        classification: acceptedCountValid ? 'lawful-evolution' : 'constitutional-regression',
        message: acceptedCountValid
            ? `accepted routing coverage count is ${Number(current.acceptedCount)}.`
            : 'accepted routing coverage count is missing or invalid.',
    }));

    const rejectedCountValid = Number.isFinite(current.rejectedCount) && Number(current.rejectedCount) >= 1;
    outcomes.push(createOutcome({
        ok: rejectedCountValid,
        severity: rejectedCountValid ? 'info' : 'error',
        invariant: 'osSurfaceIntentRouting.rejectedCount',
        classification: rejectedCountValid ? 'lawful-evolution' : 'constitutional-regression',
        message: rejectedCountValid
            ? `reject routing coverage count is ${Number(current.rejectedCount)}.`
            : 'reject routing coverage count is missing or invalid.',
    }));

    const allowlistActionCountValid =
        Number.isFinite(current.allowlistActionCount) && Number(current.allowlistActionCount) >= 1;
    outcomes.push(createOutcome({
        ok: allowlistActionCountValid,
        severity: allowlistActionCountValid ? 'info' : 'error',
        invariant: 'osSurfaceIntentRouting.allowlistActionCount',
        classification: allowlistActionCountValid ? 'lawful-evolution' : 'constitutional-regression',
        message: allowlistActionCountValid
            ? `allowlist action count is ${Number(current.allowlistActionCount)}.`
            : 'allowlist action count is missing or invalid.',
    }));

    const allowlistHashValid = typeof current.allowlistActionHash === 'string' && current.allowlistActionHash.length > 0;
    outcomes.push(createOutcome({
        ok: allowlistHashValid,
        severity: allowlistHashValid ? 'info' : 'error',
        invariant: 'osSurfaceIntentRouting.allowlistActionHash',
        classification: allowlistHashValid ? 'lawful-evolution' : 'constitutional-regression',
        message: allowlistHashValid
            ? 'allowlist action hash is present.'
            : 'allowlist action hash is missing.',
    }));

    if (isPlainObject(baseline) && typeof baseline.allowlistActionHash === 'string' && baseline.allowlistActionHash.length > 0) {
        const allowlistStable = baseline.allowlistActionHash === current.allowlistActionHash;
        outcomes.push(createOutcome({
            ok: allowlistStable,
            severity: allowlistStable ? 'info' : 'error',
            invariant: 'osSurfaceIntentRouting.allowlistActionHash-stable',
            classification: allowlistStable ? 'lawful-evolution' : 'constitutional-regression',
            message: allowlistStable
                ? 'allowlist action hash unchanged.'
                : 'allowlist action hash changed; policy expansion/regression requires explicit governance update.',
        }));
    }

    return Object.freeze(outcomes);
}
