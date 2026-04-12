function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function resolveShotStartMs(shot) {
    if (!shot || typeof shot !== 'object') return 0;
    if (Number.isFinite(shot.startMs)) return Number(shot.startMs);
    return safeNumber(shot.start);
}

function resolveShotEndMs(shot) {
    if (!shot || typeof shot !== 'object') return 0;
    if (Number.isFinite(shot.endMs)) return Number(shot.endMs);
    return resolveShotStartMs(shot) + safeNumber(shot.duration);
}

export function clampTransitionDuration({
    durationMs,
    fromShot,
    toShot,
} = {}) {
    const requested = Math.max(0, safeNumber(durationMs));
    const fromDuration = Math.max(0, resolveShotEndMs(fromShot) - resolveShotStartMs(fromShot));
    const toDuration = Math.max(0, resolveShotEndMs(toShot) - resolveShotStartMs(toShot));
    const maxDuration = Math.min(fromDuration, toDuration);

    return Math.max(0, Math.min(requested, maxDuration));
}
