import { ensureSceneCache } from './sceneCache.js';

export function evaluateNode({ nodeId, document, runtime }) {
    const scene = ensureSceneCache(runtime);

    const node = document?.sceneGraph?.nodes?.[nodeId];
    if (!node) return;

    const base = scene.computed[nodeId] || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    scene.computed[nodeId] = {
        ...base,
    };
}
