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

function sortShots(shots = []) {
    return shots
        .slice()
        .sort((left, right) => {
            const startDelta = resolveShotStartMs(left) - resolveShotStartMs(right);
            if (startDelta !== 0) return startDelta;
            return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
        });
}

function clamp(value, min, max) {
    if (max < min) return min;
    return Math.max(min, Math.min(max, value));
}

function getOtherShots(shots, excludeShotId) {
    return sortShots((Array.isArray(shots) ? shots : []).filter((shot) => shot?.id !== excludeShotId));
}

function resolveInsertionNeighbors(shots, startMs) {
    const index = shots.findIndex((shot) => resolveShotStartMs(shot) >= startMs);
    if (index === -1) {
        return {
            prev: shots[shots.length - 1] ?? null,
            next: null,
        };
    }

    return {
        prev: shots[index - 1] ?? null,
        next: shots[index] ?? null,
    };
}

export function clampShotMoveWithinTrack({ shots = [], shotId, startMs, endMs } = {}) {
    const duration = Math.max(1, safeNumber(endMs) - safeNumber(startMs));
    const others = getOtherShots(shots, shotId);
    const { prev, next } = resolveInsertionNeighbors(others, safeNumber(startMs));
    const minStart = prev ? resolveShotEndMs(prev) : 0;
    const maxEnd = next ? resolveShotStartMs(next) : Infinity;
    const availableDuration = Number.isFinite(maxEnd) ? Math.max(0, maxEnd - minStart) : Infinity;

    if (Number.isFinite(maxEnd) && availableDuration < duration) {
        return {
            startMs: minStart,
            endMs: maxEnd,
        };
    }

    const maxStart = Number.isFinite(maxEnd) ? maxEnd - duration : Infinity;
    const clampedStartMs = clamp(safeNumber(startMs), minStart, maxStart);

    return {
        startMs: clampedStartMs,
        endMs: clampedStartMs + duration,
    };
}

export function clampShotResizeWithinTrack({ shots = [], shotId, startMs, endMs, edge = 'right' } = {}) {
    const others = getOtherShots(shots, shotId);
    const rawStart = safeNumber(startMs);
    const rawEnd = Math.max(rawStart, safeNumber(endMs));

    if (edge === 'left') {
        const prev = others
            .filter((shot) => resolveShotEndMs(shot) <= rawEnd)
            .sort((left, right) => resolveShotEndMs(right) - resolveShotEndMs(left))[0] ?? null;
        const minStart = prev ? resolveShotEndMs(prev) : 0;
        return {
            startMs: clamp(rawStart, minStart, rawEnd),
            endMs: rawEnd,
        };
    }

    const next = others
        .filter((shot) => resolveShotStartMs(shot) >= rawStart)
        .sort((left, right) => resolveShotStartMs(left) - resolveShotStartMs(right))[0] ?? null;
    const maxEnd = next ? resolveShotStartMs(next) : Infinity;

    return {
        startMs: rawStart,
        endMs: clamp(rawEnd, rawStart, maxEnd),
    };
}
