import { createOutcome, isPlainObject } from './common.mjs';

export function compareOsSurfaceShellContract({
    baseline,
    current,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'osSurfaceShellContract.presence',
            classification: 'constitutional-regression',
            message: 'os surface shell contract check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    outcomes.push(createOutcome({
        ok: current.ok === true,
        severity: current.ok === true ? 'info' : 'error',
        invariant: 'osSurfaceShellContract.ok',
        classification: current.ok === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.ok === true
            ? 'os surface shell contract check passed.'
            : 'os surface shell contract check failed.',
    }));

    outcomes.push(createOutcome({
        ok: current.matrixOk === true,
        severity: current.matrixOk === true ? 'info' : 'error',
        invariant: 'osSurfaceShellContract.matrixOk',
        classification: current.matrixOk === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.matrixOk === true
            ? 'os surface shell routing matrix remains lawful.'
            : 'os surface shell routing matrix regressed.',
    }));

    outcomes.push(createOutcome({
        ok: current.projectionShapeOk === true,
        severity: current.projectionShapeOk === true ? 'info' : 'error',
        invariant: 'osSurfaceShellContract.projectionShapeOk',
        classification: current.projectionShapeOk === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.projectionShapeOk === true
            ? 'os surface shell projection shape remains canonical.'
            : 'os surface shell projection shape regressed.',
    }));

    outcomes.push(createOutcome({
        ok: current.projectionDeterministic === true,
        severity: current.projectionDeterministic === true ? 'info' : 'error',
        invariant: 'osSurfaceShellContract.projectionDeterministic',
        classification: current.projectionDeterministic === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.projectionDeterministic === true
            ? 'os surface shell projection remains deterministic.'
            : 'os surface shell projection determinism regressed.',
    }));

    if (isPlainObject(baseline)) {
        const policyVersionStable =
            typeof baseline.policyVersion === 'string' &&
            typeof current.policyVersion === 'string' &&
            baseline.policyVersion === current.policyVersion;
        outcomes.push(createOutcome({
            ok: policyVersionStable,
            severity: policyVersionStable ? 'info' : 'error',
            invariant: 'osSurfaceShellContract.policyVersion-stable',
            classification: policyVersionStable ? 'lawful-evolution' : 'constitutional-regression',
            message: policyVersionStable
                ? `policy version remains stable (${current.policyVersion}).`
                : `policy version changed (${baseline.policyVersion} -> ${current.policyVersion}).`,
        }));

        const policyHashStable =
            typeof baseline.policyHash === 'string' &&
            typeof current.policyHash === 'string' &&
            baseline.policyHash === current.policyHash;
        outcomes.push(createOutcome({
            ok: policyHashStable,
            severity: policyHashStable ? 'info' : 'error',
            invariant: 'osSurfaceShellContract.policyHash-stable',
            classification: policyHashStable ? 'lawful-evolution' : 'constitutional-regression',
            message: policyHashStable
                ? 'policy hash remains stable.'
                : `policy hash changed (${baseline.policyHash} -> ${current.policyHash}).`,
        }));

        const projectionKeyHashStable =
            typeof baseline.projectionKeyHash === 'string' &&
            typeof current.projectionKeyHash === 'string' &&
            baseline.projectionKeyHash === current.projectionKeyHash;
        outcomes.push(createOutcome({
            ok: projectionKeyHashStable,
            severity: projectionKeyHashStable ? 'info' : 'error',
            invariant: 'osSurfaceShellContract.projectionKeyHash-stable',
            classification: projectionKeyHashStable ? 'lawful-evolution' : 'constitutional-regression',
            message: projectionKeyHashStable
                ? 'projection key hash remains stable.'
                : `projection key hash changed (${baseline.projectionKeyHash} -> ${current.projectionKeyHash}).`,
        }));
    }

    return Object.freeze(outcomes);
}
