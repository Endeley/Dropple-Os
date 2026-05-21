import { createOutcome, isPlainObject } from './common.mjs';

export function compareOsSurfaceWorkspaceIdentity({
    baseline,
    current,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'osSurfaceWorkspaceIdentity.presence',
            classification: 'constitutional-regression',
            message: 'os surface workspace identity check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    outcomes.push(createOutcome({
        ok: current.ok === true,
        severity: current.ok === true ? 'info' : 'error',
        invariant: 'osSurfaceWorkspaceIdentity.ok',
        classification: current.ok === true ? 'lawful-evolution' : 'constitutional-regression',
        message: current.ok === true
            ? 'os surface workspace identity check passed.'
            : 'os surface workspace identity check failed.',
    }));

    const workspaceIdValid = typeof current.workspaceId === 'string' && current.workspaceId.trim().length > 0;
    outcomes.push(createOutcome({
        ok: workspaceIdValid,
        severity: workspaceIdValid ? 'info' : 'error',
        invariant: 'osSurfaceWorkspaceIdentity.workspaceId-present',
        classification: workspaceIdValid ? 'lawful-evolution' : 'constitutional-regression',
        message: workspaceIdValid ? 'workspace identity has a workspaceId.' : 'workspace identity missing workspaceId.',
    }));

    const modeIdValid = typeof current.modeId === 'string' && current.modeId.trim().length > 0;
    outcomes.push(createOutcome({
        ok: modeIdValid,
        severity: modeIdValid ? 'info' : 'error',
        invariant: 'osSurfaceWorkspaceIdentity.modeId-present',
        classification: modeIdValid ? 'lawful-evolution' : 'constitutional-regression',
        message: modeIdValid ? 'workspace identity has a modeId.' : 'workspace identity missing modeId.',
    }));

    const overlaysCountValid = Number.isFinite(current.overlaysCount) && Number(current.overlaysCount) >= 0;
    outcomes.push(createOutcome({
        ok: overlaysCountValid,
        severity: overlaysCountValid ? 'info' : 'error',
        invariant: 'osSurfaceWorkspaceIdentity.overlaysCount-valid',
        classification: overlaysCountValid ? 'lawful-evolution' : 'constitutional-regression',
        message: overlaysCountValid
            ? `workspace identity overlaysCount is valid (${Number(current.overlaysCount)}).`
            : 'workspace identity overlaysCount is invalid.',
    }));

    const overlaysHashValid = typeof current.overlaysHash === 'string' && current.overlaysHash.trim().length > 0;
    outcomes.push(createOutcome({
        ok: overlaysHashValid,
        severity: overlaysHashValid ? 'info' : 'error',
        invariant: 'osSurfaceWorkspaceIdentity.overlaysHash-present',
        classification: overlaysHashValid ? 'lawful-evolution' : 'constitutional-regression',
        message: overlaysHashValid
            ? 'workspace identity overlaysHash is present.'
            : 'workspace identity overlaysHash is missing.',
    }));

    if (isPlainObject(baseline)) {
        const workspaceStable =
            typeof baseline.workspaceId === 'string' &&
            typeof current.workspaceId === 'string' &&
            baseline.workspaceId === current.workspaceId;
        outcomes.push(createOutcome({
            ok: workspaceStable,
            severity: workspaceStable ? 'info' : 'error',
            invariant: 'osSurfaceWorkspaceIdentity.workspaceId-stable',
            classification: workspaceStable ? 'lawful-evolution' : 'constitutional-regression',
            message: workspaceStable
                ? `workspaceId remains stable (${current.workspaceId}).`
                : `workspaceId changed (${baseline.workspaceId} -> ${current.workspaceId}).`,
        }));

        const modeStable =
            typeof baseline.modeId === 'string' &&
            typeof current.modeId === 'string' &&
            baseline.modeId === current.modeId;
        outcomes.push(createOutcome({
            ok: modeStable,
            severity: modeStable ? 'info' : 'error',
            invariant: 'osSurfaceWorkspaceIdentity.modeId-stable',
            classification: modeStable ? 'lawful-evolution' : 'constitutional-regression',
            message: modeStable
                ? `modeId remains stable (${current.modeId}).`
                : `modeId changed (${baseline.modeId} -> ${current.modeId}).`,
        }));

        const overlaysHashStable =
            typeof baseline.overlaysHash === 'string' &&
            typeof current.overlaysHash === 'string' &&
            baseline.overlaysHash === current.overlaysHash;
        outcomes.push(createOutcome({
            ok: overlaysHashStable,
            severity: overlaysHashStable ? 'info' : 'error',
            invariant: 'osSurfaceWorkspaceIdentity.overlaysHash-stable',
            classification: overlaysHashStable ? 'lawful-evolution' : 'constitutional-regression',
            message: overlaysHashStable
                ? 'overlaysHash remains stable.'
                : `overlaysHash changed (${baseline.overlaysHash} -> ${current.overlaysHash}).`,
        }));
    }

    return Object.freeze(outcomes);
}
