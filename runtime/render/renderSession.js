function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function roundTime(value) {
    return Number(Number(value).toFixed(3));
}

function uniqueSortedTimes(values) {
    return [...new Set(values.map((value) => roundTime(value)).filter(Number.isFinite))].sort((a, b) => a - b);
}

function stableStringify(value) {
    if (value === undefined || value === null) return 'null';

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    if (typeof value === 'object') {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `"${key}":${stableStringify(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
}

function hashString64(input) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= BigInt(input.charCodeAt(index));
        hash = (hash * prime) & 0xffffffffffffffffn;
    }

    return hash.toString(16).padStart(16, '0');
}

function normalizeCameraForSession(camera) {
    if (!camera || typeof camera !== 'object') return null;

    return {
        source: camera.source ?? null,
        resolvedFrom: camera.resolvedFrom ?? null,
        timeMs: Number.isFinite(camera.timeMs) ? Number(camera.timeMs) : null,
        sequenceId: camera.sequenceId ?? null,
        shotId: camera.shotId ?? null,
        trackId: camera.trackId ?? null,
        clipId: camera.clipId ?? null,
        nodeRef: camera.nodeRef ?? null,
        transform: camera.transform
            ? {
                  x: Number(camera.transform.x ?? 0),
                  y: Number(camera.transform.y ?? 0),
                  zoom: Number(camera.transform.zoom ?? 1),
                  rotation: Number(camera.transform.rotation ?? 0),
              }
            : null,
        transition: camera.transition
            ? {
                  active: camera.transition.active === true,
                  type: camera.transition.type ?? null,
                  progress: Number(camera.transition.progress ?? 0),
                  fromShotId: camera.transition.fromShotId ?? null,
                  toShotId: camera.transition.toShotId ?? null,
              }
            : null,
    };
}

function normalizeShotTimelineForSession(renderInput) {
    const shots = Array.isArray(renderInput?.shotTimeline?.shots) ? renderInput.shotTimeline.shots : [];
    return shots.map((shot) => ({
        id: shot?.id ?? null,
        startMs: safeNumber(shot?.startMs),
        endMs: safeNumber(shot?.endMs),
        transitionOut: shot?.transitionOut
            ? {
                  type: shot.transitionOut.type ?? null,
                  durationMs: safeNumber(shot.transitionOut.durationMs, -1),
              }
            : null,
    }));
}

function buildRenderInputFingerprint(renderInput) {
    return {
        activeSceneId: renderInput?.activeSceneId ?? null,
        activeShotId: renderInput?.activeShotId ?? null,
        frameRate: resolveRenderFrameRate(renderInput),
        sceneRootIds: Array.isArray(renderInput?.sceneGraph?.rootIds) ? [...renderInput.sceneGraph.rootIds] : [],
        sequenceId: renderInput?.temporalContext?.sequenceId ?? null,
        camera: normalizeCameraForSession(renderInput?.camera ?? null),
        shotTimeline: normalizeShotTimelineForSession(renderInput),
    };
}

function collectTransitionBoundaryTimes(renderInput, fromMs, toMs) {
    const shots = normalizeShotTimelineForSession(renderInput);
    const values = [];

    for (const shot of shots) {
        const transition = shot?.transitionOut ?? null;
        const durationMs = safeNumber(transition?.durationMs, -1);
        if (!transition || durationMs < 0) continue;

        const endMs = safeNumber(shot?.endMs);
        const startMs = durationMs === 0 ? endMs : endMs - durationMs;
        if (startMs >= fromMs && startMs <= toMs) values.push(startMs);
        if (endMs >= fromMs && endMs <= toMs) values.push(endMs);
    }

    return values;
}

function buildFrameTimes({ fromMs, toMs, stepMs, renderInput }) {
    const times = [];
    let cursor = fromMs;

    while (cursor <= toMs) {
        times.push(cursor);
        cursor = roundTime(cursor + stepMs);
        if (times.length > 100000) {
            throw new Error('buildRenderSession produced an unreasonable frame count.');
        }
    }

    if (times.length === 0 || times[times.length - 1] !== toMs) {
        times.push(toMs);
    }

    times.push(...collectTransitionBoundaryTimes(renderInput, fromMs, toMs));

    return uniqueSortedTimes(times);
}

function buildSampleTimes({
    fromMs,
    toMs,
    stepMs,
    sampleCount,
    includeTransitionBoundaries,
    renderInput,
} = {}) {
    const normalizedSampleCount = Math.max(2, Number(sampleCount ?? 4));
    const sampleTimes = [];

    if (fromMs === toMs) {
        sampleTimes.push(fromMs);
    } else {
        for (let index = 0; index < normalizedSampleCount; index += 1) {
            const progress = normalizedSampleCount === 1 ? 0 : index / (normalizedSampleCount - 1);
            const timeMs = fromMs + (toMs - fromMs) * progress;
            const snapped = Math.round(timeMs / stepMs) * stepMs;
            sampleTimes.push(Math.max(fromMs, Math.min(toMs, snapped)));
        }
    }

    if (includeTransitionBoundaries) {
        sampleTimes.push(...collectTransitionBoundaryTimes(renderInput, fromMs, toMs));
    }

    return uniqueSortedTimes(sampleTimes);
}

export function resolveRenderFrameRate(renderInput) {
    const frameRate = Number(renderInput?.frameRate ?? renderInput?.temporalContext?.frameRate ?? 24);
    return Number.isFinite(frameRate) && frameRate > 0 ? frameRate : 24;
}

export function resolveRenderStepMs(renderInput) {
    return roundTime(1000 / resolveRenderFrameRate(renderInput));
}

export function resolveRenderDurationMs(renderInput) {
    const shots = Array.isArray(renderInput?.shotTimeline?.shots) ? renderInput.shotTimeline.shots : [];
    if (shots.length === 0) return 0;
    return shots.reduce((max, shot) => Math.max(max, safeNumber(shot?.endMs)), 0);
}

export function buildRenderSession({
    renderInput,
    fromMs = 0,
    toMs = null,
    framePolicy = null,
    samplePolicy = null,
} = {}) {
    if (!renderInput || typeof renderInput !== 'object') {
        throw new Error('buildRenderSession requires renderInput.');
    }

    const resolvedFrameRate = resolveRenderFrameRate(renderInput);
    const resolvedStepMs = resolveRenderStepMs(renderInput);
    const durationMs = Math.max(0, resolveRenderDurationMs(renderInput));
    const resolvedFromMs = Math.max(0, safeNumber(fromMs));
    const resolvedToMs = Math.max(
        resolvedFromMs,
        Number.isFinite(toMs) ? Number(toMs) : durationMs,
    );
    const normalizedFramePolicy = Object.freeze({
        mode: framePolicy?.mode ?? 'sequence-frame-rate',
        frameRate: Number.isFinite(framePolicy?.frameRate) ? Number(framePolicy.frameRate) : resolvedFrameRate,
        stepMs: Number.isFinite(framePolicy?.stepMs) ? roundTime(framePolicy.stepMs) : resolvedStepMs,
    });
    const normalizedSamplePolicy = Object.freeze({
        mode: samplePolicy?.mode ?? 'stability-preflight',
        sampleCount: Math.max(2, Number(samplePolicy?.sampleCount ?? 4)),
        includeTransitionBoundaries: samplePolicy?.includeTransitionBoundaries !== false,
    });

    const frameTimes = buildFrameTimes({
        fromMs: resolvedFromMs,
        toMs: resolvedToMs,
        stepMs: normalizedFramePolicy.stepMs,
        renderInput,
    });
    const sampleTimes = buildSampleTimes({
        fromMs: resolvedFromMs,
        toMs: resolvedToMs,
        stepMs: normalizedFramePolicy.stepMs,
        sampleCount: normalizedSamplePolicy.sampleCount,
        includeTransitionBoundaries: normalizedSamplePolicy.includeTransitionBoundaries,
        renderInput,
    });
    const sessionManifest = {
        renderInputFingerprint: buildRenderInputFingerprint(renderInput),
        fromMs: resolvedFromMs,
        toMs: resolvedToMs,
        durationMs,
        framePolicy: normalizedFramePolicy,
        samplePolicy: normalizedSamplePolicy,
        frameTimes,
        sampleTimes,
    };

    return Object.freeze({
        sessionId: `render-session:${hashString64(stableStringify(sessionManifest))}`,
        frameRate: normalizedFramePolicy.frameRate,
        stepMs: normalizedFramePolicy.stepMs,
        durationMs,
        fromMs: resolvedFromMs,
        toMs: resolvedToMs,
        frameTimes,
        totalFrames: frameTimes.length,
        sampleTimes,
        framePolicy: normalizedFramePolicy,
        samplePolicy: normalizedSamplePolicy,
    });
}
