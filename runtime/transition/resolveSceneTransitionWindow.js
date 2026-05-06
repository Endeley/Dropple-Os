import { assertCanonicalShotSequence } from '@/core/scene/sceneGraphInvariants.js';
import {
    assertActiveCameraTransitionTopology,
    assertCameraTransitionProgress,
    assertCameraTransitionWindows,
} from './assertCameraTransitionGovernance.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function clamp01(value) {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
}

function getOrderedShots(shotTimeline) {
    const shots = Array.isArray(shotTimeline?.shots) ? shotTimeline.shots.filter(Boolean) : [];
    return shots
        .slice()
        .sort((left, right) => {
            const startDelta = safeNumber(left?.startMs) - safeNumber(right?.startMs);
            if (startDelta !== 0) return startDelta;
            return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
        });
}

function resolveCurrentShot(shots, activeShotId, timeMs) {
    if (activeShotId) {
        return shots.find((shot) => shot?.id === activeShotId) ?? null;
    }

    return (
        shots.find((shot) => {
            const startMs = safeNumber(shot?.startMs);
            const endMs = safeNumber(shot?.endMs);
            return timeMs >= startMs && timeMs <= endMs;
        }) ?? null
    );
}

function normalizeTransition(transitionOut) {
    if (!transitionOut || typeof transitionOut !== 'object') return null;

    const type = transitionOut.type;
    const durationMs = safeNumber(transitionOut.durationMs, -1);

    if (type !== 'cut' && type !== 'crossfade') return null;
    if (durationMs < 0) return null;

    return {
        type,
        durationMs,
    };
}

export function resolveSceneTransitionWindow({
    shots = [],
    activeShotId = null,
    timeMs = 0,
} = {}) {
    const orderedShots = getOrderedShots({ shots });
    assertCanonicalShotSequence(orderedShots, { sceneId: 'transition-window' });
    assertCameraTransitionWindows(orderedShots);
    const now = safeNumber(timeMs);
    const fromShot = resolveCurrentShot(orderedShots, activeShotId, now);

    if (!fromShot) return null;

    const transition = normalizeTransition(fromShot?.transitionOut);
    if (!transition) return null;

    const fromIndex = orderedShots.findIndex((shot) => shot?.id === fromShot?.id);
    const fromEndMs = safeNumber(fromShot?.endMs);
    const durationMs = safeNumber(transition.durationMs);
    const transitionStart = durationMs === 0 ? fromEndMs : fromEndMs - durationMs;
    const transitionEnd = fromEndMs;
    const isTransitionActive =
        durationMs === 0 ? now >= fromEndMs : now >= transitionStart && now <= transitionEnd;

    if (!isTransitionActive) return null;

    assertActiveCameraTransitionTopology({
        orderedShots,
        fromIndex,
        transition,
    });

    const toShot = orderedShots[fromIndex + 1] ?? null;

    if (durationMs === 0) {
        return {
            fromShotId: fromShot.id,
            toShotId: toShot.id,
            transition,
            t: 1,
            fromShot,
            toShot,
        };
    }

    const t = clamp01((now - transitionStart) / durationMs);
    assertCameraTransitionProgress({ t });

    return {
        fromShotId: fromShot.id,
        toShotId: toShot.id,
        transition,
        t,
        fromShot,
        toShot,
    };
}
