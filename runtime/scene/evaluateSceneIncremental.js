import { computeDirtyDomains } from './computeDirtyNodes.js';
import { buildDependencyGraph } from './buildDependencyGraph.js';
import { buildEvaluationLayers } from './buildEvaluationLayers.js';
import { topologicalSort } from './topologicalSort.js';
import { collectDirtyNodes } from './collectDirtyNodes.js';
import { buildLayoutRootIndex } from './layoutRootIndex.js';
import { ensureSceneCache } from './sceneCache.js';
import { evaluateNode } from './evaluateNode.js';
import { buildScenePartitions } from './partition/buildScenePartitions.js';
import { collectDirtyPartitions } from './partition/collectDirtyPartitions.js';
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
        scene.evaluationLayers = null;
        scene.layoutRoots = new Map();
        scene.partitions = null;
    }

    const graph =
        scene.dependencyGraph ||
        (scene.dependencyGraph = buildDependencyGraph(document));
    scene.evaluationOrder =
        scene.evaluationOrder ||
        topologicalSort(graph);
    const layers =
        scene.evaluationLayers ||
        (scene.evaluationLayers = buildEvaluationLayers(graph));
    scene.partitions =
        scene.partitions ||
        buildScenePartitions(document);
    scene.layoutRoots =
        scene.layoutRoots.size
            ? scene.layoutRoots
            : buildLayoutRootIndex(document);

    if (scene.transformDirty.size > 0) {
        const transformDirty = new Set(scene.transformDirty);
        const propagated = collectDirtyNodes(graph, transformDirty);
        const dirtyPartitions = collectDirtyPartitions(scene, propagated);

        for (const partitionId of [...dirtyPartitions].sort()) {
            const partition = scene.partitions?.get(partitionId);
            if (!partition) continue;

            for (const layer of layers) {
                for (const nodeId of layer) {
                    if (!partition.nodes.has(nodeId) || !propagated.has(nodeId)) continue;

                    evaluateNode({
                        nodeId,
                        document,
                        runtime,
                    });
                    scene.indexDirty.add(nodeId);
                }
            }

            partition.dirty = false;
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
