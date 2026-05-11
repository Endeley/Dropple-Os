function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeTransition(transitionOut) {
    if (!transitionOut || typeof transitionOut !== 'object') return null;

    const type = transitionOut.type;
    const durationMs = safeNumber(transitionOut.durationMs, -1);

    if (type !== 'cut' && type !== 'crossfade') {
        throw new Error(
            `camera transition governance: unsupported transition type ${String(type)}`,
        );
    }
    if (durationMs < 0) {
        throw new Error('camera transition governance: transition duration must be >= 0');
    }

    return {
        type,
        durationMs,
    };
}

export function assertCameraTransitionWindows(shots = []) {
    for (const shot of shots) {
        const transition = normalizeTransition(shot?.transitionOut);
        if (!transition) continue;

        const startMs = safeNumber(shot?.startMs);
        const endMs = safeNumber(shot?.endMs);

        if (transition.durationMs === 0) continue;

        const windowStartMs = endMs - transition.durationMs;

        if (windowStartMs < startMs) {
            throw new Error(
                `camera transition governance: transition window must remain within owning shot (${String(shot?.id ?? 'unknown')})`,
            );
        }
    }
}

export function assertCameraTransitionProgress(transitionWindow) {
    if (!transitionWindow) return;

    const t = transitionWindow.t;
    if (!Number.isFinite(t) || t < 0 || t > 1) {
        throw new Error('camera transition governance: transition progress must be within [0, 1]');
    }
}

export function assertCameraTransitionAuthority({
    transitionWindow,
    fromShotCamera = null,
    toShotCamera = null,
    sequenceCamera = null,
} = {}) {
    if (!transitionWindow || transitionWindow.transition?.type !== 'crossfade') return;

    const fromOwner = fromShotCamera ?? sequenceCamera;
    const toOwner = toShotCamera ?? sequenceCamera;

    if ((fromOwner && !toOwner) || (!fromOwner && toOwner)) {
        throw new Error(
            `camera transition governance: ambiguous authority across transition ${String(transitionWindow.fromShotId ?? 'unknown')} -> ${String(transitionWindow.toShotId ?? 'unknown')}`,
        );
    }
}

export function assertActiveCameraTransitionTopology({
    orderedShots = [],
    fromIndex = -1,
    transition = null,
} = {}) {
    if (!transition) return;

    const fromShot = fromIndex >= 0 ? orderedShots[fromIndex] ?? null : null;
    const toShot = fromIndex >= 0 ? orderedShots[fromIndex + 1] ?? null : null;

    if (!fromShot || !toShot) {
        throw new Error(
            `camera transition governance: last shot cannot own an outgoing transition (${String(fromShot?.id ?? 'unknown')})`,
        );
    }

    const fromEndMs = safeNumber(fromShot?.endMs);
    const toStartMs = safeNumber(toShot?.startMs);
    if (toStartMs !== fromEndMs) {
        throw new Error(
            `camera transition governance: transition target must be adjacent and contiguous (${String(fromShot?.id ?? 'unknown')} -> ${String(toShot?.id ?? 'unknown')})`,
        );
    }

    const nextTransition = normalizeTransition(toShot?.transitionOut);
    if (!nextTransition || nextTransition.durationMs === 0) return;

    const toEndMs = safeNumber(toShot?.endMs);
    const nextWindowStartMs = toEndMs - nextTransition.durationMs;
    if (nextWindowStartMs <= toStartMs) {
        throw new Error(
            `camera transition governance: adjacent transition chaining is not allowed (${String(fromShot?.id ?? 'unknown')} -> ${String(toShot?.id ?? 'unknown')})`,
        );
    }
}
