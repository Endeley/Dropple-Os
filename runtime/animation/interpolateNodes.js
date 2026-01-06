import { perfStart, perfEnd } from '@/perf/perfTracker.js';

let lastFrameTime = 0;
const FRAME_BUDGET = 1000 / 60; // ~60fps

export function interpolateNodes(fromNodes, toNodes, t) {
    const now = performance.now();
    if (now - lastFrameTime < FRAME_BUDGET) {
        return toNodes; // skip interpolation frame under budget
    }

    lastFrameTime = now;

    perfStart('animation.interpolate');
    const result = {};

    Object.keys(toNodes).forEach((id) => {
        const a = fromNodes[id];
        const b = toNodes[id];

        if (!a || !b) {
            result[id] = b;
            return;
        }

        result[id] = {
            ...b,
            x: lerp(a.x, b.x, t),
            y: lerp(a.y, b.y, t),
            width: lerp(a.width, b.width, t),
            height: lerp(a.height, b.height, t),
            opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t),
        };
    });

    perfEnd('animation.interpolate');
    return result;
}

function lerp(a = 0, b = 0, t) {
    return a + (b - a) * t;
}
