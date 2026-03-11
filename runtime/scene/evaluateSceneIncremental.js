import { computeDirtyDomains } from './computeDirtyNodes.js';
import { buildDependencyGraph } from './buildDependencyGraph.js';
import { topologicalSort } from './topologicalSort.js';
import { collectDirtyNodes } from './collectDirtyNodes.js';
import { buildLayoutRootIndex } from './layoutRootIndex.js';
import { ensureSceneCache } from './sceneCache.js';
import { evaluateNode } from './evaluateNode.js';
import { orderDirtyNodes } from './orderDirtyNodes.js';
import { resolveLayoutRoots } from '@/runtime/layout/resolveLayoutRoots.js';
import { evaluateLayoutRoots } from '@/runtime/layout/evaluateLayoutRoots.js';
import { updateSpatialIndex } from '@/runtime/spatial/index.js';

function isStructuralEvent(eventType) {
    return (
        eventType === 'node/create' ||
        eventType === 'node/delete' ||
        eventType === 'node/reparent' ||
        eventType === 'node/attach' ||
        eventType === 'node/wrap' ||
        eventType === 'node/unwrap'
    );
}

export function evaluateSceneIncremental({ event, document, runtime = {} }) {
    const scene = ensureSceneCache(runtime);
    computeDirtyDomains({ event, runtime });

    if (isStructuralEvent(event?.type)) {
        scene.dependencyGraph = null;
        scene.evaluationOrder = null;
        scene.layoutRoots = new Map();
    }

    const graph =
        scene.dependencyGraph ||
        (scene.dependencyGraph = buildDependencyGraph(document));
    const order =
        scene.evaluationOrder ||
        (scene.evaluationOrder = topologicalSort(graph));
    scene.layoutRoots =
        scene.layoutRoots.size
            ? scene.layoutRoots
            : buildLayoutRootIndex(document);

    if (scene.transformDirty.size > 0) {
        const transformDirty = new Set(scene.transformDirty);
        const propagated = collectDirtyNodes(graph, transformDirty);
        const transformOrder = orderDirtyNodes(order, propagated);

        for (const nodeId of transformOrder) {
            evaluateNode({
                nodeId,
                document,
                runtime,
            });
            scene.indexDirty.add(nodeId);
        }

        scene.transformDirty.clear();
    }

    if (scene.layoutDirty.size > 0) {
        const layoutRoots = resolveLayoutRoots(scene.layoutDirty, scene.layoutRoots);
        evaluateLayoutRoots({
            roots: layoutRoots,
            document,
            runtime,
        });
        scene.layoutDirty.clear();
    }

    if (scene.paintDirty.size > 0) {
        scene.paintDirty.clear();
    }

    if (scene.indexDirty.size > 0) {
        updateSpatialIndex(scene, [...scene.indexDirty]);
        scene.indexDirty.clear();
    }

    return runtime;
}
