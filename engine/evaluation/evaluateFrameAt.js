import { useRuntimeStore } from '../../runtime/stores/useRuntimeStore.js';
import { evaluateShotAt } from './evaluateShotAt.js';
import { hashEvaluatedScene } from './hashFrame.js';

const nodeHashCache = new Map();

/**
 * Canonical deterministic evaluation entrypoint.
 */
export function evaluateFrameAt(
    timeMs,
    {
        reason,
        sceneGraph,
        shotTimeline,
        activeShotId,
        cameraTransform,
        previousEvaluatedScene,
        cache = null,
        commit = true,
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
        const activeCache = cache ?? nodeHashCache;
        frameHash = hashEvaluatedScene(evaluatedScene, {
            previousEvaluatedScene,
            cache: activeCache,
        });
    }

    if (commit) {
        useRuntimeStore.setState(
            {
                frameTime: timeMs,
                evaluatedScene,
                frameHash,
                shotId,
                shotTimeMs,
                evalStatus,
            },
            false
        );
    }

    return {
        frameTime: timeMs,
        frameHash,
        shotId,
        shotTimeMs,
        evalStatus,
        evaluatedScene,
        reason: reason ?? 'unknown',
    };
}
