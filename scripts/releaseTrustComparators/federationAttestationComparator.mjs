import { createOutcome, isPlainObject } from './common.mjs';

export function compareFederationAttestation({
    baseline,
    current,
    strict = false,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'federationAttestation.presence',
            classification: 'constitutional-regression',
            message: 'federation attestation check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    const currentOk = current.ok === true;
    outcomes.push(createOutcome({
        ok: currentOk,
        severity: currentOk ? 'info' : 'error',
        invariant: 'federationAttestation.ok',
        classification: currentOk ? 'lawful-evolution' : 'constitutional-regression',
        message: currentOk ? 'federation attestation remains valid.' : 'federation attestation failed.',
    }));

    const tamperRejected = current.tamperRejected === true;
    outcomes.push(createOutcome({
        ok: tamperRejected,
        severity: tamperRejected ? 'info' : 'error',
        invariant: 'federationAttestation.tamperRejected',
        classification: tamperRejected ? 'lawful-evolution' : 'constitutional-regression',
        message: tamperRejected
            ? 'federation tamper rejection guarantee holds.'
            : 'federation tamper rejection guarantee regressed.',
    }));

    if (isPlainObject(baseline)) {
        const hashChanged = String(current.hash ?? '') !== String(baseline.hash ?? '');
        outcomes.push(createOutcome({
            ok: strict ? !hashChanged : true,
            severity: hashChanged ? (strict ? 'error' : 'warning') : 'info',
            invariant: 'federationAttestation.hash',
            classification: hashChanged ? 'semantic-drift' : 'lawful-evolution',
            message: hashChanged ? 'federation attestation hash changed.' : 'federation attestation hash unchanged.',
        }));
    }

    return Object.freeze(outcomes);
}

