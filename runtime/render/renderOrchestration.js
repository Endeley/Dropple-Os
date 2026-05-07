import { evaluateFrameAt } from '@/engine/evaluation/evaluateFrameAt.js';
import { hashEvaluatedScene } from '@/engine/evaluation/hashFrame.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { evaluateTransitionFrame } from '@/runtime/transition/evaluateTransitionFrame.js';
import {
    buildRenderSession,
    resolveRenderDurationMs,
    resolveRenderFrameRate,
    resolveRenderStepMs,
} from './renderSession.js';

export function buildRenderSchedule({
    renderInput,
    fromMs = 0,
    toMs = null,
    sampleCount = 4,
    includeTransitionBoundaries = true,
} = {}) {
    const session = buildRenderSession({
        renderInput,
        fromMs,
        toMs,
        samplePolicy: {
            mode: 'stability-preflight',
            sampleCount,
            includeTransitionBoundaries,
        },
    });

    return Object.freeze({
        frameRate: session.frameRate,
        stepMs: session.stepMs,
        fromMs: session.fromMs,
        toMs: session.toMs,
        durationMs: session.durationMs,
        sampleTimes: session.sampleTimes,
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

    const resolvedTimeMs = Number.isFinite(timeMs) ? Number(timeMs) : Number(renderInput?.timeMs ?? 0);
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
