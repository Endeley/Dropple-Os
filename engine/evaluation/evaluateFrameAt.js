import { useRuntimeStore } from '../../runtime/stores/useRuntimeStore.js';
import { evaluateScene } from '../scene/evaluateScene.js';
import { hashEvaluatedScene } from './hashFrame.js';

const nodeHashCache = new Map();

/**
 * Canonical deterministic evaluation entrypoint.
 */
export function evaluateFrameAt(
    timeMs,
    { reason, previousEvaluatedScene, cache = null, commit = true } = {}
) {
    const evaluatedScene = evaluateScene(timeMs);
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
            },
            false
        );
    }

    return {
        frameTime: timeMs,
        frameHash,
        reason: reason ?? 'unknown',
    };
}
