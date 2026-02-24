import { evaluateScene } from './evaluateScene.js';

function toFiniteNumber(value, label) {
    if (!Number.isFinite(value)) {
        throw new Error(`evaluateShotAt: ${label} must be a finite number`);
    }
    return value;
}

function assertTransformInvariant(transform, label) {
    if (transform == null) return;
    if (typeof transform !== 'object') {
        throw new Error(`evaluateShotAt: ${label} must be an object when provided`);
    }
    if ('x' in transform) {
        const x = transform.x;
        const isNumber = Number.isFinite(x);
        const isKeyframes = Boolean(x && typeof x === 'object' && 'keyframes' in x);
        if (!isNumber && !isKeyframes) {
            throw new Error(
                `evaluateShotAt: ${label}.x must be a finite number or keyframes when provided`
            );
        }
    }
    if ('y' in transform) {
        const y = transform.y;
        const isNumber = Number.isFinite(y);
        const isKeyframes = Boolean(y && typeof y === 'object' && 'keyframes' in y);
        if (!isNumber && !isKeyframes) {
            throw new Error(
                `evaluateShotAt: ${label}.y must be a finite number or keyframes when provided`
            );
        }
    }
}

function validateTimeline(shotTimeline) {
    if (!shotTimeline || typeof shotTimeline !== 'object') {
        throw new Error('evaluateShotAt: shotTimeline must be an object');
    }
    const shots = shotTimeline.shots;
    if (!Array.isArray(shots)) {
        throw new Error('evaluateShotAt: shotTimeline.shots must be an array');
    }

    let lastEnd = -Infinity;
    for (let i = 0; i < shots.length; i += 1) {
        const shot = shots[i];
        if (!shot || typeof shot !== 'object') {
            throw new Error('evaluateShotAt: shot must be an object');
        }
        if (typeof shot.id !== 'string' || shot.id.length === 0) {
            throw new Error('evaluateShotAt: shot.id must be a non-empty string');
        }
        const startMs = toFiniteNumber(shot.startMs, 'shot.startMs');
        const endMs = toFiniteNumber(shot.endMs, 'shot.endMs');
        if (startMs >= endMs) {
            throw new Error('evaluateShotAt: shot.startMs must be less than shot.endMs');
        }
        if (startMs < lastEnd) {
            throw new Error('evaluateShotAt: shots must be sorted by startMs and non-overlapping');
        }
        lastEnd = endMs;

        if (shot.timeOffsetMs != null) {
            toFiniteNumber(shot.timeOffsetMs, 'shot.timeOffsetMs');
        }

        assertTransformInvariant(shot.cameraTransform, 'shot.cameraTransform');
    }

    if (shotTimeline.activeShotId != null && typeof shotTimeline.activeShotId !== 'string') {
        throw new Error('evaluateShotAt: shotTimeline.activeShotId must be a string when provided');
    }
}

function selectShot(shotTimeline, timeMs, options) {
    const { shotId } = options || {};
    const shots = shotTimeline.shots || [];

    if (shotId) {
        const explicit = shots.find((shot) => shot.id === shotId);
        if (!explicit) {
            throw new Error(`evaluateShotAt: shotId not found: ${shotId}`);
        }
        return explicit;
    }

    if (shotTimeline.activeShotId) {
        const active = shots.find((shot) => shot.id === shotTimeline.activeShotId);
        if (!active) {
            throw new Error(`evaluateShotAt: activeShotId not found: ${shotTimeline.activeShotId}`);
        }
        return active;
    }

    return shots.find((shot) => timeMs >= shot.startMs && timeMs < shot.endMs) || null;
}

function clampShotTime(timeMs, shot) {
    const duration = shot.endMs - shot.startMs;
    let shotTimeMs = timeMs - shot.startMs;
    if (shot.timeOffsetMs != null) {
        shotTimeMs += shot.timeOffsetMs;
    }
    if (shotTimeMs < 0) return 0;
    if (shotTimeMs > duration) return duration;
    return shotTimeMs;
}

export function evaluateShotAt(shotTimeline, sceneGraph, timeMs, options = {}) {
    validateTimeline(shotTimeline);
    if (!Number.isFinite(timeMs)) {
        throw new Error('evaluateShotAt: timeMs must be a finite number');
    }

    const shot = selectShot(shotTimeline, timeMs, options);
    if (!shot) {
        return { ok: false, reason: 'NO_SHOT', timeMs };
    }

    const shotTimeMs = clampShotTime(timeMs, shot);
    const cameraTransform = shot.cameraTransform ?? options.cameraTransform ?? null;
    assertTransformInvariant(cameraTransform, 'cameraTransform');

    const evaluatedScene = evaluateScene(sceneGraph, shotTimeMs, { cameraTransform });

    return {
        ok: true,
        shotId: shot.id,
        timeMs,
        shotTimeMs,
        evaluatedScene,
    };
}
