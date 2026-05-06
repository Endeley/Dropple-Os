import { evaluateFrameAt } from '@/engine/evaluation/evaluateFrameAt.js';
import { hashEvaluatedScene } from '@/engine/evaluation/hashFrame.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { evaluateTransitionFrame } from '@/runtime/transition/evaluateTransitionFrame.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function roundTime(value) {
    return Number(Number(value).toFixed(3));
}

function uniqueSortedTimes(values) {
    return [...new Set(values.map((value) => roundTime(value)).filter(Number.isFinite))].sort((a, b) => a - b);
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

function collectTransitionBoundaryTimes(renderInput, fromMs, toMs) {
    const shots = Array.isArray(renderInput?.shotTimeline?.shots) ? renderInput.shotTimeline.shots : [];
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

export function buildRenderSchedule({
    renderInput,
    fromMs = 0,
    toMs = null,
    sampleCount = 4,
    includeTransitionBoundaries = true,
} = {}) {
    const frameRate = resolveRenderFrameRate(renderInput);
    const stepMs = resolveRenderStepMs(renderInput);
    const durationMs = Math.max(0, resolveRenderDurationMs(renderInput));
    const resolvedFromMs = Math.max(0, safeNumber(fromMs));
    const resolvedToMs = Math.max(
        resolvedFromMs,
        Number.isFinite(toMs) ? Number(toMs) : durationMs,
    );
    const normalizedSampleCount = Math.max(2, Number(sampleCount ?? 4));
    const sampleTimes = [];

    if (resolvedFromMs === resolvedToMs) {
        sampleTimes.push(resolvedFromMs);
    } else {
        for (let index = 0; index < normalizedSampleCount; index += 1) {
            const progress = normalizedSampleCount === 1 ? 0 : index / (normalizedSampleCount - 1);
            const timeMs = resolvedFromMs + (resolvedToMs - resolvedFromMs) * progress;
            const snapped = Math.round(timeMs / stepMs) * stepMs;
            sampleTimes.push(Math.max(resolvedFromMs, Math.min(resolvedToMs, snapped)));
        }
    }

    if (includeTransitionBoundaries) {
        sampleTimes.push(...collectTransitionBoundaryTimes(renderInput, resolvedFromMs, resolvedToMs));
    }

    return Object.freeze({
        frameRate,
        stepMs,
        fromMs: resolvedFromMs,
        toMs: resolvedToMs,
        durationMs,
        sampleTimes: uniqueSortedTimes(sampleTimes),
    });
}

export function evaluateRenderFrame({
    renderInput,
    timeMs = null,
    reason = 'render',
    previousEvaluatedScene = null,
    cache = null,
    commit = true,
} = {}) {
    if (!renderInput || typeof renderInput !== 'object') {
        throw new Error('evaluateRenderFrame requires renderInput.');
    }

    const resolvedTimeMs = Number.isFinite(timeMs) ? Number(timeMs) : safeNumber(renderInput?.timeMs);
    const transitionResult = evaluateTransitionFrame({
        renderInput: {
            ...renderInput,
            timeMs: resolvedTimeMs,
        },
        timeMs: resolvedTimeMs,
    });
    const transitionWindow = transitionResult?.transitionWindow ?? null;

    if (!transitionWindow) {
        return evaluateFrameAt(resolvedTimeMs, {
            reason,
            sceneGraph: renderInput.sceneGraphTree,
            shotTimeline: renderInput.shotTimeline,
            activeShotId: renderInput.activeShotId,
            cameraTransform: renderInput?.camera?.transform ?? null,
            previousEvaluatedScene,
            cache,
            commit,
        });
    }

    const evaluatedScene = transitionResult?.evaluatedScene ?? null;
    const frameHash =
        process.env.NODE_ENV !== 'production'
            ? hashEvaluatedScene(evaluatedScene, {
                  previousEvaluatedScene,
                  cache: cache ?? new Map(),
              })
            : null;

    if (commit) {
        useRuntimeStore.setState(
            {
                frameTime: resolvedTimeMs,
                evaluatedScene,
                frameHash,
                shotId: transitionResult?.shotId ?? null,
                shotTimeMs: transitionResult?.shotTimeMs ?? null,
                evalStatus: transitionResult?.ok ? 'OK' : 'NO_SHOT',
            },
            false,
        );
    }

    return {
        frameTime: resolvedTimeMs,
        frameHash,
        shotId: transitionResult?.shotId ?? null,
        shotTimeMs: transitionResult?.shotTimeMs ?? null,
        evalStatus: transitionResult?.ok ? 'OK' : 'NO_SHOT',
        evaluatedScene,
        reason,
        transitionWindow,
    };
}
