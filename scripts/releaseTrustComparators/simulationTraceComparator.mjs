import { createOutcome, isPlainObject } from './common.mjs';

export function compareSimulationTrace({
    baseline,
    current,
    strict = false,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'simulationTrace.presence',
            classification: 'constitutional-regression',
            message: 'simulation trace check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    const currentOk = current.ok === true;
    outcomes.push(createOutcome({
        ok: currentOk,
        severity: currentOk ? 'info' : 'error',
        invariant: 'simulationTrace.ok',
        classification: currentOk ? 'lawful-evolution' : 'constitutional-regression',
        message: currentOk ? 'simulation trace validation remains valid.' : 'simulation trace validation failed.',
    }));

    const lineage = current.primitiveTraceLineageProvided === true;
    outcomes.push(createOutcome({
        ok: lineage,
        severity: lineage ? 'info' : 'error',
        invariant: 'simulationTrace.primitiveTraceLineage',
        classification: lineage ? 'lawful-evolution' : 'constitutional-regression',
        message: lineage
            ? 'primitive trace lineage guarantee holds.'
            : 'primitive trace lineage guarantee regressed.',
    }));

    const tamperRejected = current.tamperRejected === true;
    outcomes.push(createOutcome({
        ok: tamperRejected,
        severity: tamperRejected ? 'info' : 'error',
        invariant: 'simulationTrace.tamperRejected',
        classification: tamperRejected ? 'lawful-evolution' : 'constitutional-regression',
        message: tamperRejected
            ? 'simulation tamper rejection guarantee holds.'
            : 'simulation tamper rejection guarantee regressed.',
    }));

    if (isPlainObject(baseline)) {
        const fingerprintChanged = String(current.fingerprint ?? '') !== String(baseline.fingerprint ?? '');
        outcomes.push(createOutcome({
            ok: strict ? !fingerprintChanged : true,
            severity: fingerprintChanged ? (strict ? 'error' : 'warning') : 'info',
            invariant: 'simulationTrace.fingerprint',
            classification: fingerprintChanged ? 'semantic-drift' : 'lawful-evolution',
            message: fingerprintChanged ? 'simulation trace fingerprint changed.' : 'simulation trace fingerprint unchanged.',
        }));
    }

    return Object.freeze(outcomes);
}

