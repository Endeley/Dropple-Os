import { buildSceneTree } from '../../domain/scene/buildSceneTree.js';
import { findSceneShot, getSceneShots } from '@/core/scene/shotTracks.js';

function getActiveScene(sceneGraph, activeSceneId) {
    if (!sceneGraph || !activeSceneId || !Array.isArray(sceneGraph.scenes)) {
        return null;
    }

    return sceneGraph.scenes.find((scene) => scene?.id === activeSceneId) ?? null;
}

function resolveScopedRootId(sceneGraph, activeSceneId, activeShotId) {
    const scene = getActiveScene(sceneGraph, activeSceneId);
    const shots = getSceneShots(scene);
    if (!scene || shots.length === 0) {
        return null;
    }

    const activeShot = activeShotId ? findSceneShot(scene, activeShotId)?.shot ?? null : null;
    const orderedShots = activeShot ? [activeShot, ...shots.filter((shot) => shot?.id !== activeShot.id)] : shots;

    for (const shot of orderedShots) {
        const compositionId = shot?.compositionId ?? null;
        if (compositionId && sceneGraph?.nodes?.[compositionId]) {
            return compositionId;
        }
    }

    return null;
}

function throwStrictScopeError(reason, details) {
    throw new Error(`extractActiveSceneTree: ${reason}${details ? ` (${details})` : ''}`);
}

export function extractActiveSceneTree(
    sceneGraph,
    activeSceneId,
    activeShotId = null,
    { strict = false } = {},
) {
    const nodes = sceneGraph?.nodes ?? {};
    const scopedRootId = resolveScopedRootId(sceneGraph, activeSceneId, activeShotId);
    const fallbackRootId = sceneGraph?.rootIds?.[0] ?? null;
    const rootId = scopedRootId ?? fallbackRootId;

    if (strict && !scopedRootId) {
        if (!activeSceneId) {
            throwStrictScopeError('missing activeSceneId');
        }
        if (!getActiveScene(sceneGraph, activeSceneId)) {
            throwStrictScopeError('active scene not found', activeSceneId);
        }
        throwStrictScopeError('no valid composition root', activeSceneId);
    }

    if (!rootId || !nodes[rootId]) {
        if (strict) {
            throwStrictScopeError('root node not found', String(rootId ?? 'null'));
        }
        return null;
    }

    const root = buildSceneTree({
        rootId,
        nodes: Object.values(nodes),
        tree: Object.fromEntries(
            Object.entries(nodes).map(([id, node]) => [
                id,
                Array.isArray(node?.children) ? node.children : [],
            ])
        ),
    });

    return root ?? null;
}
