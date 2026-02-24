import { evaluateFrameAt } from './evaluateFrameAt.js';
import { evaluateFrameHeadless } from './evaluateFrameHeadless.js';

if (process.env.NODE_ENV === 'production') {
    throw new Error('validateFrameParity is dev-only');
}

export function validateFrameParity({ fromMs = 0, toMs = 2000, stepMs = 33 } = {}) {
    let headPrev = null;
    let livePrev = null;

    const headCache = new Map();
    const liveCache = new Map();

    const mismatches = [];
    let samples = 0;

    for (let t = fromMs; t <= toMs; t += stepMs) {
        const head = evaluateFrameHeadless(t, {
            previousEvaluatedScene: headPrev,
            cache: headCache,
            reason: 'parity-headless',
        });

        const live = evaluateFrameAt(t, {
            previousEvaluatedScene: livePrev,
            cache: liveCache,
            reason: 'parity-live',
            commit: false,
        });

        samples += 1;

        if (head.frameHash !== live.frameHash) {
            mismatches.push({
                timeMs: t,
                headlessHash: head.frameHash,
                liveHash: live.frameHash,
            });
        }

        headPrev = head.evaluatedScene;
        livePrev = live.evaluatedScene;
    }

    return {
        ok: mismatches.length === 0,
        samples,
        mismatches,
    };
}
