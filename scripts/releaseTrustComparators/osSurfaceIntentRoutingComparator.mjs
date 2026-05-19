import { createOutcome, isPlainObject } from './common.mjs';

export function compareOsSurfaceIntentRouting({
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

    return Object.freeze(outcomes);
}
