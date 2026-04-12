const SNAP_PRIORITY = Object.freeze({
    'shot-start': 3,
    'shot-end': 3,
    playhead: 2,
    grid: 1,
});

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function abs(value) {
    return value < 0 ? -value : value;
}

function resolveShotStartMs(shot) {
    if (!shot || typeof shot !== 'object') return 0;
    if (Number.isFinite(shot.startMs)) return Number(shot.startMs);
    return safeNumber(shot.start);
}

function resolveShotEndMs(shot) {
    if (!shot || typeof shot !== 'object') return 0;
    if (Number.isFinite(shot.endMs)) return Number(shot.endMs);

    const startMs = resolveShotStartMs(shot);
    if (Number.isFinite(shot.duration)) {
        return startMs + Number(shot.duration);
    }

    return startMs;
}

function compareTargets(left, right) {
    const valueDelta = safeNumber(left?.value) - safeNumber(right?.value);
    if (valueDelta !== 0) return valueDelta;

    const typeDelta = String(left?.type ?? '').localeCompare(String(right?.type ?? ''));
    if (typeDelta !== 0) return typeDelta;

    return String(left?.shotId ?? '').localeCompare(String(right?.shotId ?? ''));
}

function normalizeGuide(candidate, anchor = null) {
    if (!candidate) return null;
    return {
        ...candidate.meta,
        type: candidate.type,
        snapped: candidate.value,
        dist: candidate.dist,
        anchor,
    };
}

function compareCandidates(left, right) {
    if (!left && !right) return 0;
    if (!left) return 1;
    if (!right) return -1;

    const priorityDelta = safeNumber(right.priority) - safeNumber(left.priority);
    if (priorityDelta !== 0) return priorityDelta;

    const distDelta = safeNumber(left.dist) - safeNumber(right.dist);
    if (distDelta !== 0) return distDelta;

    const valueDelta = safeNumber(left.value) - safeNumber(right.value);
    if (valueDelta !== 0) return valueDelta;

    return String(left.type ?? '').localeCompare(String(right.type ?? ''));
}

function resolveSingleSnapCandidate({
    value,
    context,
    thresholdMs = 20,
} = {}) {
    const targets = Array.isArray(context?.targets) ? context.targets : [];
    const gridSizeMs = safeNumber(context?.gridSizeMs, 0);

    let best = null;

    for (const target of targets) {
        const dist = abs(value - safeNumber(target?.value));
        if (dist > thresholdMs) continue;

        const candidate = {
            value: safeNumber(target.value),
            dist,
            type: target.type ?? 'unknown',
            priority: SNAP_PRIORITY[target?.type] ?? 0,
            meta: target,
        };

        if (compareCandidates(candidate, best) < 0) {
            best = candidate;
        }
    }

    if (gridSizeMs > 0) {
        const snapped = Math.round(value / gridSizeMs) * gridSizeMs;
        const dist = abs(value - snapped);
        if (dist <= thresholdMs) {
            const candidate = {
                value: snapped,
                dist,
                type: 'grid',
                priority: SNAP_PRIORITY.grid,
                meta: {
                    type: 'grid',
                    value: snapped,
                },
            };

            if (compareCandidates(candidate, best) < 0) {
                best = candidate;
            }
        }
    }

    return best;
}

function resolveSingleSnap({
    value,
    context,
    thresholdMs = 20,
    anchor = null,
} = {}) {
    const candidate = resolveSingleSnapCandidate({
        value,
        context,
        thresholdMs,
    });

    return {
        snapped: candidate ? candidate.value : value,
        guide: normalizeGuide(candidate, anchor),
        candidate,
    };
}

export function collectShotSnapTargets({
    shots = [],
    excludeShotId = null,
    playheadMs = null,
    gridSizeMs = 0,
} = {}) {
    const targets = [];

    for (const shot of shots) {
        if (!shot || shot.id === excludeShotId) continue;

        const start = resolveShotStartMs(shot);
        const end = resolveShotEndMs(shot);

        targets.push({ type: 'shot-start', value: start, shotId: shot.id });
        targets.push({ type: 'shot-end', value: end, shotId: shot.id });
    }

    if (Number.isFinite(playheadMs)) {
        targets.push({ type: 'playhead', value: Number(playheadMs), shotId: null });
    }

    targets.sort(compareTargets);

    return {
        targets,
        gridSizeMs: safeNumber(gridSizeMs, 0) > 0 ? safeNumber(gridSizeMs, 0) : 0,
    };
}

export function resolveShotDragSnap({
    startMs,
    endMs,
    context,
    thresholdMs = 20,
} = {}) {
    const rawStartMs = safeNumber(startMs);
    const rawEndMs = safeNumber(endMs);
    const duration = rawEndMs - rawStartMs;

    const startSnap = resolveSingleSnap({
        value: rawStartMs,
        context,
        thresholdMs,
        anchor: 'start',
    });
    const endSnap = resolveSingleSnap({
        value: rawEndMs,
        context,
        thresholdMs,
        anchor: 'end',
    });

    const bestCandidate =
        compareCandidates(startSnap.candidate, endSnap.candidate) <= 0
            ? startSnap.candidate
            : endSnap.candidate;

    if (!bestCandidate) {
        return {
            startMs: rawStartMs,
            endMs: rawEndMs,
            guides: [],
        };
    }

    if (bestCandidate === startSnap.candidate) {
        return {
            startMs: startSnap.snapped,
            endMs: startSnap.snapped + duration,
            guides: startSnap.guide ? [startSnap.guide] : [],
        };
    }

    return {
        startMs: endSnap.snapped - duration,
        endMs: endSnap.snapped,
        guides: endSnap.guide ? [endSnap.guide] : [],
    };
}

export function resolveShotResizeRightSnap({
    startMs,
    endMs,
    context,
    thresholdMs = 20,
} = {}) {
    const rawStartMs = safeNumber(startMs);
    const rawEndMs = safeNumber(endMs);
    const snap = resolveSingleSnap({
        value: rawEndMs,
        context,
        thresholdMs,
        anchor: 'end',
    });

    return {
        startMs: rawStartMs,
        endMs: snap.snapped,
        guides: snap.guide ? [snap.guide] : [],
    };
}

export function resolveShotResizeLeftSnap({
    startMs,
    endMs,
    context,
    thresholdMs = 20,
} = {}) {
    const rawStartMs = safeNumber(startMs);
    const rawEndMs = safeNumber(endMs);
    const snap = resolveSingleSnap({
        value: rawStartMs,
        context,
        thresholdMs,
        anchor: 'start',
    });

    return {
        startMs: snap.snapped,
        endMs: rawEndMs,
        guides: snap.guide ? [snap.guide] : [],
    };
}
