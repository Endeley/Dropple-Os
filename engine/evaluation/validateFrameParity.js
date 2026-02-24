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

    const sceneGraph = {
        id: 'root',
        type: 'frame',
        channels: {
            'transform.x': [
                { t: 0, v: 0 },
                { t: 1000, v: 10 },
            ],
            'transform.y': 0,
            opacity: 1,
        },
        visibility: true,
        children: [],
    };

    const shotTimeline = {
        shots: [
            {
                id: 'shotA',
                startMs: 0,
                endMs: 2000,
            },
        ],
    };

    const mismatches = [];
    let samples = 0;

    for (let t = fromMs; t <= toMs; t += stepMs) {
        const head = evaluateFrameHeadless(t, {
            sceneGraph,
            shotTimeline,
            previousEvaluatedScene: headPrev,
            cache: headCache,
            reason: 'parity-headless',
        });

        const live = evaluateFrameAt(t, {
            sceneGraph,
            shotTimeline,
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
