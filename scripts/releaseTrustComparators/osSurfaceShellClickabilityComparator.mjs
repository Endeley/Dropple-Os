import { createOutcome, isPlainObject } from './common.mjs';

export function compareOsSurfaceShellClickability({
    current,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'osSurfaceShellClickability.presence',
            classification: 'constitutional-regression',
            message: 'os surface shell clickability check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    for (const invariantKey of ['ok', 'helperPresent', 'publishGuarded', 'addKeyframeGuarded']) {
        const passed = current[invariantKey] === true;
        outcomes.push(createOutcome({
            ok: passed,
            severity: passed ? 'info' : 'error',
            invariant: `osSurfaceShellClickability.${invariantKey}`,
            classification: passed ? 'lawful-evolution' : 'constitutional-regression',
            message: passed
                ? `${invariantKey} contract satisfied.`
                : `${invariantKey} contract violated.`,
        }));
    }

    const trialGuardCountValid = Number.isFinite(current.trialGuardCount) && Number(current.trialGuardCount) >= 1;
    outcomes.push(createOutcome({
        ok: trialGuardCountValid,
        severity: trialGuardCountValid ? 'info' : 'error',
        invariant: 'osSurfaceShellClickability.trialGuardCount',
        classification: trialGuardCountValid ? 'lawful-evolution' : 'constitutional-regression',
        message: trialGuardCountValid
            ? `trial click guard count is ${Number(current.trialGuardCount)}.`
            : 'trial click guard count is missing or invalid.',
    }));

    return Object.freeze(outcomes);
}
