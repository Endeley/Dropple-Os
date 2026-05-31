import { createOutcome, isPlainObject } from './common.mjs';

export function compareBlueprintBootstrapProvenance({ baseline, current, strict = false } = {}) {
    if (!isPlainObject(current)) {
        return Object.freeze([
            createOutcome({
                ok: false,
                severity: 'error',
                invariant: 'blueprintBootstrapProvenance.presence',
                classification: 'constitutional-regression',
                message: 'blueprint bootstrap provenance check is missing in current report.',
            }),
        ]);
    }

    const outcomes = [];
    outcomes.push(
        createOutcome({
            ok: current.ok === true,
            severity: 'error',
            invariant: 'blueprintBootstrapProvenance.ok',
            classification: 'constitutional-regression',
            message:
                current.ok === true
                    ? 'blueprint bootstrap provenance remains valid.'
                    : 'blueprint bootstrap provenance check failed.',
        }),
    );
    outcomes.push(
        createOutcome({
            ok: current.deterministicManifest === true,
            severity: 'error',
            invariant: 'blueprintBootstrapProvenance.deterministicManifest',
            classification: 'constitutional-regression',
            message:
                current.deterministicManifest === true
                    ? 'blueprint install manifest generation remains deterministic.'
                    : 'blueprint install manifest generation is non-deterministic.',
        }),
    );
    outcomes.push(
        createOutcome({
            ok: current.persisted === true && current.bootstrapEventPersisted === true,
            severity: 'error',
            invariant: 'blueprintBootstrapProvenance.persisted',
            classification: 'constitutional-regression',
            message:
                current.persisted === true && current.bootstrapEventPersisted === true
                    ? 'blueprint bootstrap provenance persists through canonical event truth.'
                    : 'blueprint bootstrap provenance did not persist through canonical event truth.',
        }),
    );
    outcomes.push(
        createOutcome({
            ok: current.replayEquivalent === true,
            severity: 'error',
            invariant: 'blueprintBootstrapProvenance.replayEquivalent',
            classification: 'constitutional-regression',
            message:
                current.replayEquivalent === true
                    ? 'blueprint bootstrap provenance remains replay-equivalent.'
                    : 'blueprint bootstrap provenance is not replay-equivalent.',
        }),
    );
    outcomes.push(
        createOutcome({
            ok: current.perspectiveRoutable === true,
            severity: 'error',
            invariant: 'blueprintBootstrapProvenance.perspectiveRoutable',
            classification: 'constitutional-regression',
            message:
                current.perspectiveRoutable === true
                    ? 'bootstrap default perspective remains routable.'
                    : 'bootstrap default perspective is not routable.',
        }),
    );

    if (isPlainObject(baseline) && typeof baseline.projectIdHash === 'string' && baseline.projectIdHash.trim()) {
        const stable = String(current.projectIdHash ?? '') === baseline.projectIdHash;
        outcomes.push(
            createOutcome({
                ok: stable || !strict,
                severity: stable ? 'info' : strict ? 'error' : 'warning',
                invariant: 'blueprintBootstrapProvenance.projectIdHash-stable',
                classification: stable ? 'lawful-evolution' : strict ? 'constitutional-regression' : 'semantic-drift',
                message: stable
                    ? 'bootstrap project id hash unchanged.'
                    : strict
                      ? 'bootstrap project id hash changed.'
                      : 'bootstrap project id hash changed (non-strict).',
            }),
        );
    }

    return Object.freeze(outcomes);
}
