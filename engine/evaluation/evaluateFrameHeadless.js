import { evaluateScene } from '../scene/evaluateScene.js';
import { hashEvaluatedScene } from './hashFrame.js';

export function evaluateFrameHeadless(
    timeMs,
    { previousEvaluatedScene = null, cache = null, reason = 'headless' } = {}
) {
    const evaluatedScene = evaluateScene(timeMs);

    let frameHash = null;
    if (process.env.NODE_ENV !== 'production') {
        frameHash = hashEvaluatedScene(evaluatedScene, { previousEvaluatedScene, cache });
    }

    return {
        frameTime: timeMs,
        evaluatedScene,
        frameHash,
        reason,
    };
}
