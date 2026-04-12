export class ShotTransitionValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ShotTransitionValidationError';
    }
}

export function normalizeShotTransitionOut(shot) {
    const normalizedTransitionOut = normalizeTransitionOut(shot?.transitionOut);
    if (normalizedTransitionOut === shot?.transitionOut) {
        return shot;
    }

    return {
        ...shot,
        transitionOut: normalizedTransitionOut,
    };
}

export function normalizeTransitionOut(input) {
    if (input == null) return null;
    if (typeof input !== 'object') {
        throw new ShotTransitionValidationError(
            'loadProjectV2: shot.transitionOut must be an object when provided',
        );
    }

    const candidate = input;
    const type = candidate.type;
    if (type !== 'cut' && type !== 'crossfade') {
        throw new ShotTransitionValidationError(
            `loadProjectV2: unsupported shot.transitionOut type ${String(type)}`,
        );
    }

    const rawDurationMs = candidate.durationMs;
    const durationMs = rawDurationMs == null ? 0 : Number(rawDurationMs);
    if (!Number.isFinite(durationMs) || durationMs < 0) {
        throw new ShotTransitionValidationError(
            'loadProjectV2: shot.transitionOut.durationMs must be a finite number >= 0',
        );
    }

    return {
        type,
        durationMs,
    };
}

export function isShotTransitionValidationError(error) {
    return error instanceof ShotTransitionValidationError;
}
