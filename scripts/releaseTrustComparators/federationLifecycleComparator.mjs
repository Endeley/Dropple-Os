import { createOutcome, isPlainObject } from './common.mjs';

export function compareFederationLifecycle({
    current,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'federationLifecycle.presence',
            classification: 'constitutional-regression',
            message: 'federation lifecycle check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    const lifecycleOk = current.ok === true;
    outcomes.push(createOutcome({
        ok: lifecycleOk,
        severity: lifecycleOk ? 'info' : 'error',
        invariant: 'federationLifecycle.ok',
        classification: lifecycleOk ? 'lawful-evolution' : 'constitutional-regression',
        message: lifecycleOk ? 'federation lifecycle gate remains valid.' : 'federation lifecycle gate failed.',
    }));

    const replayEquivalent = current.replayEquivalent === true;
    outcomes.push(createOutcome({
        ok: replayEquivalent,
        severity: replayEquivalent ? 'info' : 'error',
        invariant: 'federationLifecycle.replayEquivalent',
        classification: replayEquivalent ? 'lawful-evolution' : 'constitutional-regression',
        message: replayEquivalent
            ? 'federation resume equivalence guarantee holds.'
            : 'federation resume equivalence guarantee regressed.',
    }));

    const staleRejected = current.staleRejected === true;
    outcomes.push(createOutcome({
        ok: staleRejected,
        severity: staleRejected ? 'info' : 'error',
        invariant: 'federationLifecycle.staleRejected',
        classification: staleRejected ? 'lawful-evolution' : 'constitutional-regression',
        message: staleRejected
            ? 'federation stale-event rejection guarantee holds.'
            : 'federation stale-event rejection guarantee regressed.',
    }));

    const orderingClosed = current.orderingClosed === true;
    outcomes.push(createOutcome({
        ok: orderingClosed,
        severity: orderingClosed ? 'info' : 'error',
        invariant: 'federationLifecycle.orderingClosed',
        classification: orderingClosed ? 'lawful-evolution' : 'constitutional-regression',
        message: orderingClosed
            ? 'federation ordering/closure guarantee holds.'
            : 'federation ordering/closure guarantee regressed.',
    }));

    return Object.freeze(outcomes);
}
