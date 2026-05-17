import { createOutcome, isPlainObject } from './common.mjs';

export function compareArchitectureGate({
    baseline,
    current,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'architectureGate.presence',
            classification: 'constitutional-regression',
            message: 'architecture gate check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    outcomes.push(createOutcome({
        ok: current.ok === true,
        severity: current.ok === true ? 'info' : 'error',
        invariant: 'architectureGate.ok',
        classification: current.ok === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.ok === true
            ? 'architecture gate remains healthy.'
            : 'architecture gate failed in current report.',
    }));

    if (isPlainObject(baseline)) {
        const baselineExit = Number.isFinite(baseline.exitCode) ? Number(baseline.exitCode) : 1;
        const currentExit = Number.isFinite(current.exitCode) ? Number(current.exitCode) : 1;
        const regressed = currentExit > baselineExit;
        outcomes.push(createOutcome({
            ok: !regressed,
            severity: regressed ? 'error' : (currentExit !== baselineExit ? 'warning' : 'info'),
            invariant: 'architectureGate.exitCode-regression',
            classification: regressed ? 'constitutional-regression' : 'lawful-evolution',
            message: regressed
                ? `architecture gate exitCode regressed (${baselineExit} -> ${currentExit}).`
                : `architecture gate exitCode ${baselineExit === currentExit ? 'unchanged' : `changed (${baselineExit} -> ${currentExit})`}.`,
        }));
    }

    return Object.freeze(outcomes);
}

