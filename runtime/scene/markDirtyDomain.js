import { ensureSceneCache } from './sceneCache.js';

export function markDirtyDomain(runtime, nodeId, domain) {
    if (!nodeId) return;

    const scene = ensureSceneCache(runtime);
    const set = scene?.[domain];

    if (!(set instanceof Set)) return;

    set.add(nodeId);
}
