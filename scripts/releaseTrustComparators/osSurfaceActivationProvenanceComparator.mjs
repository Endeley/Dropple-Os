import { createOutcome, isPlainObject } from './common.mjs';

export function compareOsSurfaceActivationProvenance({
    baseline,
    current,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'osSurfaceActivationProvenance.presence',
            classification: 'constitutional-regression',
            message: 'os surface activation provenance check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    outcomes.push(createOutcome({
        ok: current.ok === true,
        severity: current.ok === true ? 'info' : 'error',
        invariant: 'osSurfaceActivationProvenance.ok',
        classification: current.ok === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.ok === true
            ? 'os surface activation provenance check passed.'
            : 'os surface activation provenance check failed.',
    }));

    outcomes.push(createOutcome({
        ok: current.tuplesDeterministic === true,
        severity: current.tuplesDeterministic === true ? 'info' : 'error',
        invariant: 'osSurfaceActivationProvenance.tuplesDeterministic',
        classification: current.tuplesDeterministic === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.tuplesDeterministic === true
            ? 'os surface activation provenance tuples remain deterministic.'
            : 'os surface activation provenance tuples are non-deterministic.',
    }));

    const sampleCountValid = Number.isFinite(current.sampleCount) && Number(current.sampleCount) > 0;
    outcomes.push(createOutcome({
        ok: sampleCountValid,
        severity: sampleCountValid ? 'info' : 'error',
        invariant: 'osSurfaceActivationProvenance.sampleCount-valid',
        classification: sampleCountValid ? 'lawful-evolution' : 'constitutional-regression',
        message: sampleCountValid
            ? `os surface activation provenance sample count is valid (${Number(current.sampleCount)}).`
            : 'os surface activation provenance sample count is invalid.',
    }));

    const tuplesHashPresent = typeof current.tuplesHash === 'string' && current.tuplesHash.trim().length > 0;
    outcomes.push(createOutcome({
        ok: tuplesHashPresent,
        severity: tuplesHashPresent ? 'info' : 'error',
        invariant: 'osSurfaceActivationProvenance.tuplesHash-present',
        classification: tuplesHashPresent ? 'lawful-evolution' : 'constitutional-regression',
        message: tuplesHashPresent
            ? 'os surface activation provenance tuplesHash is present.'
            : 'os surface activation provenance tuplesHash is missing.',
    }));

    if (isPlainObject(baseline)) {
        const sourceHashStable =
            typeof baseline.sourceHash === 'string' &&
            typeof current.sourceHash === 'string' &&
            baseline.sourceHash === current.sourceHash;
        outcomes.push(createOutcome({
            ok: sourceHashStable,
            severity: sourceHashStable ? 'info' : 'error',
            invariant: 'osSurfaceActivationProvenance.sourceHash-stable',
            classification: sourceHashStable ? 'lawful-evolution' : 'constitutional-regression',
            message: sourceHashStable
                ? 'activation source hash remains stable.'
                : `activation source hash changed (${baseline.sourceHash} -> ${current.sourceHash}).`,
        }));

        const overlayHashStable =
            typeof baseline.overlayHash === 'string' &&
            typeof current.overlayHash === 'string' &&
            baseline.overlayHash === current.overlayHash;
        outcomes.push(createOutcome({
            ok: overlayHashStable,
            severity: overlayHashStable ? 'info' : 'error',
            invariant: 'osSurfaceActivationProvenance.overlayHash-stable',
            classification: overlayHashStable ? 'lawful-evolution' : 'constitutional-regression',
            message: overlayHashStable
                ? 'activation overlay hash remains stable.'
                : `activation overlay hash changed (${baseline.overlayHash} -> ${current.overlayHash}).`,
        }));

        const tuplesHashStable =
            typeof baseline.tuplesHash === 'string' &&
            typeof current.tuplesHash === 'string' &&
            baseline.tuplesHash === current.tuplesHash;
        outcomes.push(createOutcome({
            ok: tuplesHashStable,
            severity: tuplesHashStable ? 'info' : 'error',
            invariant: 'osSurfaceActivationProvenance.tuplesHash-stable',
            classification: tuplesHashStable ? 'lawful-evolution' : 'constitutional-regression',
            message: tuplesHashStable
                ? 'activation tuple hash remains stable.'
                : `activation tuple hash changed (${baseline.tuplesHash} -> ${current.tuplesHash}).`,
        }));
    }

    return Object.freeze(outcomes);
}
