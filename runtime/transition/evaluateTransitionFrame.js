import { evaluateShotAt } from '../../engine/evaluation/evaluateShotAt.js';
import { extractActiveSceneTree } from '../scene/extractActiveSceneTree.js';
import { composeSceneTransition } from './composeSceneTransition.js';
import { resolveSceneTransitionWindow } from './resolveSceneTransitionWindow.js';

function normalizeRenderInput(options = {}) {
    if (options?.renderInput && typeof options.renderInput === 'object') {
        return options.renderInput;
    }

    return {
        sceneGraph: options?.sceneGraph ?? null,
        activeSceneId: options?.activeSceneId ?? null,
        shotTimeline: options?.shotTimeline ?? null,
        activeShotId: options?.activeShotId ?? null,
        temporalContext: options?.temporalContext ?? null,
        camera:
            options?.camera ??
            (options?.cameraTransform
                ? {
                      transform: options.cameraTransform,
                  }
                : null),
        strictSceneScope: options?.strictSceneScope ?? true,
        timeMs: options?.timeMs ?? 0,
    };
}

function evaluateScopedShot({
    shotTimeline,
    sceneGraph,
    activeSceneId,
    shotId,
    timeMs,
    cameraTransform,
    strictSceneScope = true,
}) {
    const scopedSceneGraph = extractActiveSceneTree(sceneGraph, activeSceneId, shotId, {
        strict: strictSceneScope,
    });

    return evaluateShotAt(shotTimeline, scopedSceneGraph, timeMs, {
        shotId,
        cameraTransform,
    });
}

export function evaluateTransitionFrame({
    renderInput = null,
    shotTimeline,
    sceneGraph,
    activeSceneId,
    activeShotId = null,
    timeMs = 0,
    cameraTransform = null,
    camera = null,
    temporalContext = null,
    strictSceneScope = true,
} = {}) {
    const normalizedRenderInput = normalizeRenderInput({
        renderInput,
        shotTimeline,
        sceneGraph,
        activeSceneId,
        activeShotId,
        timeMs,
        cameraTransform,
        camera,
        temporalContext,
        strictSceneScope,
    });
    const resolvedTimeMs = Number.isFinite(timeMs) ? timeMs : normalizedRenderInput.timeMs ?? 0;
    const resolvedCameraTransform =
        normalizedRenderInput?.camera?.transform ?? cameraTransform ?? null;

    const transitionWindow = resolveSceneTransitionWindow({
        shots: normalizedRenderInput?.shotTimeline?.shots,
        activeShotId: normalizedRenderInput?.activeShotId ?? null,
        timeMs: resolvedTimeMs,
    });

    if (!transitionWindow) {
        return evaluateScopedShot({
            shotTimeline: normalizedRenderInput?.shotTimeline ?? null,
            sceneGraph: normalizedRenderInput?.sceneGraph ?? null,
            activeSceneId: normalizedRenderInput?.activeSceneId ?? null,
            shotId: normalizedRenderInput?.activeShotId ?? null,
            timeMs: resolvedTimeMs,
            cameraTransform: resolvedCameraTransform,
            strictSceneScope: normalizedRenderInput?.strictSceneScope ?? true,
        });
    }

    const sceneAResult = evaluateScopedShot({
        shotTimeline: normalizedRenderInput?.shotTimeline ?? null,
        sceneGraph: normalizedRenderInput?.sceneGraph ?? null,
        activeSceneId: normalizedRenderInput?.activeSceneId ?? null,
        shotId: transitionWindow.fromShotId,
        timeMs: resolvedTimeMs,
        cameraTransform: resolvedCameraTransform,
        strictSceneScope: normalizedRenderInput?.strictSceneScope ?? true,
    });
    const sceneBResult = evaluateScopedShot({
        shotTimeline: normalizedRenderInput?.shotTimeline ?? null,
        sceneGraph: normalizedRenderInput?.sceneGraph ?? null,
        activeSceneId: normalizedRenderInput?.activeSceneId ?? null,
        shotId: transitionWindow.toShotId,
        timeMs: resolvedTimeMs,
        cameraTransform: resolvedCameraTransform,
        strictSceneScope: normalizedRenderInput?.strictSceneScope ?? true,
    });
    const composedScene = composeSceneTransition({
        sceneA: sceneAResult.evaluatedScene,
        sceneB: sceneBResult.evaluatedScene,
        transition: transitionWindow.transition,
        t: transitionWindow.t,
    });

    return {
        ...sceneAResult,
        shotId: transitionWindow.fromShotId,
        evaluatedScene: composedScene,
        transitionWindow,
    };
}
