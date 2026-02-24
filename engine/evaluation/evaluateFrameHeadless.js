import { evaluateShotAt } from './evaluateShotAt.js';
import { hashEvaluatedScene } from './hashFrame.js';

export function evaluateFrameHeadless(
    timeMs,
    {
        sceneGraph,
        shotTimeline,
        activeShotId,
        cameraTransform,
        previousEvaluatedScene = null,
        cache = null,
        reason = 'headless',
    } = {}
) {
    let evaluatedScene = {
        __evaluatedSchemaVersion: 1,
        children: [],
    };
    let shotId = null;
    let shotTimeMs = null;
    let evalStatus = 'NO_SHOT';

    if (sceneGraph && shotTimeline) {
        const shotResult = evaluateShotAt(shotTimeline, sceneGraph, timeMs, {
            shotId: activeShotId ?? null,
            cameraTransform,
        });

        if (shotResult.ok) {
            evaluatedScene = shotResult.evaluatedScene;
            shotId = shotResult.shotId;
            shotTimeMs = shotResult.shotTimeMs;
            evalStatus = 'OK';
        }
    }

    let frameHash = null;
    if (process.env.NODE_ENV !== 'production') {
        frameHash = hashEvaluatedScene(evaluatedScene, { previousEvaluatedScene, cache });
    }

    return {
        frameTime: timeMs,
        evaluatedScene,
        frameHash,
        shotId,
        shotTimeMs,
        evalStatus,
        reason,
    };
}
