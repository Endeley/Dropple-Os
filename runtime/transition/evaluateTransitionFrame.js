import { evaluateShotAt } from '../../engine/evaluation/evaluateShotAt.js';
import { extractActiveSceneTree } from '../scene/extractActiveSceneTree.js';
import { composeSceneTransition } from './composeSceneTransition.js';
import { resolveSceneTransitionWindow } from './resolveSceneTransitionWindow.js';

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
    shotTimeline,
    sceneGraph,
    activeSceneId,
    activeShotId = null,
    timeMs = 0,
    cameraTransform = null,
    strictSceneScope = true,
} = {}) {
    const transitionWindow = resolveSceneTransitionWindow({
        shots: shotTimeline?.shots,
        activeShotId,
        timeMs,
    });

    if (!transitionWindow) {
        return evaluateScopedShot({
            shotTimeline,
            sceneGraph,
            activeSceneId,
            shotId: activeShotId ?? null,
            timeMs,
            cameraTransform,
            strictSceneScope,
        });
    }

    const sceneAResult = evaluateScopedShot({
        shotTimeline,
        sceneGraph,
        activeSceneId,
        shotId: transitionWindow.fromShotId,
        timeMs,
        cameraTransform,
        strictSceneScope,
    });
    const sceneBResult = evaluateScopedShot({
        shotTimeline,
        sceneGraph,
        activeSceneId,
        shotId: transitionWindow.toShotId,
        timeMs,
        cameraTransform,
        strictSceneScope,
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
