import { compareVersions, createOutcome, isPlainObject } from './common.mjs';

export function compareExportVerification({
    baseline,
    current,
    strict = false,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'exportVerification.presence',
            classification: 'constitutional-regression',
            message: 'export verification check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    outcomes.push(createOutcome({
        ok: current.ok === true,
        severity: current.ok === true ? 'info' : 'error',
        invariant: 'exportVerification.ok',
        classification: current.ok === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.ok === true
            ? 'export verification remains valid.'
            : 'export verification check failed.',
    }));

    if (!isPlainObject(baseline)) return Object.freeze(outcomes);

    const versionCmp = compareVersions(current.canonicalVersion, baseline.canonicalVersion);
    const downgraded = versionCmp < 0;
    outcomes.push(createOutcome({
        ok: !downgraded,
        severity: downgraded ? 'error' : (versionCmp === 0 ? 'info' : 'warning'),
        invariant: 'exportVerification.canonicalVersion',
        classification: downgraded ? 'constitutional-regression' : 'semantic-drift',
        message: downgraded
            ? `canonicalVersion downgraded (${baseline.canonicalVersion} -> ${current.canonicalVersion}).`
            : `canonicalVersion ${versionCmp === 0 ? 'unchanged' : `changed (${baseline.canonicalVersion} -> ${current.canonicalVersion})`}.`,
    }));

    const algorithmChanged = String(current.algorithm ?? '') !== String(baseline.algorithm ?? '');
    outcomes.push(createOutcome({
        ok: strict ? !algorithmChanged : true,
        severity: algorithmChanged ? (strict ? 'error' : 'warning') : 'info',
        invariant: 'exportVerification.algorithm',
        classification: algorithmChanged ? 'semantic-drift' : 'lawful-evolution',
        message: algorithmChanged
            ? `algorithm changed (${baseline.algorithm} -> ${current.algorithm}).`
            : 'algorithm unchanged.',
    }));

    const hashChanged = String(current.exportHash ?? '') !== String(baseline.exportHash ?? '');
    outcomes.push(createOutcome({
        ok: strict ? !hashChanged : true,
        severity: hashChanged ? (strict ? 'error' : 'warning') : 'info',
        invariant: 'exportVerification.exportHash',
        classification: hashChanged ? 'semantic-drift' : 'lawful-evolution',
        message: hashChanged ? 'exportHash changed.' : 'exportHash unchanged.',
    }));

    return Object.freeze(outcomes);
}

