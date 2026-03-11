import { computeDirtyDomains } from './computeDirtyNodes.js';
import { buildDependencyGraph } from './buildDependencyGraph.js';
import { buildEvaluationLayers } from './buildEvaluationLayers.js';
import { buildSegmentGraph } from './graph/buildSegmentGraph.js';
import { buildSegments } from './graph/buildSegments.js';
import { topologicalSort } from './topologicalSort.js';
import { collectDirtyNodes } from './collectDirtyNodes.js';
import { buildLayoutRootIndex } from './layoutRootIndex.js';
import { ensureSceneCache } from './sceneCache.js';
import { buildScenePartitions } from './partition/buildScenePartitions.js';
import { collectDirtyPartitions } from './partition/collectDirtyPartitions.js';
import { collectVisiblePartitions } from './partition/collectVisiblePartitions.js';
import { updatePartitionBounds } from './partition/updatePartitionBounds.js';
import { schedulePartitions } from './scheduler/schedulePartitions.js';
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

function resolveViewportBounds(runtime) {
    const viewport = runtime?.workspace?.viewport ?? null;

    if (
        Number.isFinite(viewport?.x) &&
        Number.isFinite(viewport?.y) &&
        Number.isFinite(viewport?.width) &&
        Number.isFinite(viewport?.height)
    ) {
        return {
            x: viewport.x,
            y: viewport.y,
            width: viewport.width,
            height: viewport.height,
        };
    }

    return {
        x: -Infinity,
        y: -Infinity,
        width: Infinity,
        height: Infinity,
    };
}

export function evaluateSceneIncremental({ event, document, runtime = {} }) {
    const scene = ensureSceneCache(runtime);
    computeDirtyDomains({ event, runtime });

    if (isStructuralEvent(event?.type)) {
        scene.dependencyGraph = null;
        scene.segments = null;
        scene.nodeToSegment = null;
        scene.segmentGraph = null;
        scene.evaluationOrder = null;
        scene.evaluationLayers = null;
        scene.layoutRoots = new Map();
        scene.partitions = null;
        scene.nodeToPartition = null;
    }

    const graph =
        scene.dependencyGraph ||
        (scene.dependencyGraph = buildDependencyGraph(document));
    if (!scene.segments || !scene.nodeToSegment) {
        const segmentData = buildSegments(graph);
        scene.segments = segmentData.segments;
        scene.nodeToSegment = segmentData.nodeToSegment;
    }
    scene.segmentGraph =
        scene.segmentGraph ||
        buildSegmentGraph(graph, scene.nodeToSegment);
    scene.evaluationOrder =
        scene.evaluationOrder ||
        topologicalSort(graph);
    const layers =
        scene.evaluationLayers ||
        (scene.evaluationLayers = buildEvaluationLayers(graph));
    if (!scene.partitions || !scene.nodeToPartition) {
        const partitionData = buildScenePartitions(document);
        scene.partitions = partitionData.partitions;
        scene.nodeToPartition = partitionData.nodeToPartition;
    }
    scene.layoutRoots =
        scene.layoutRoots.size
            ? scene.layoutRoots
            : buildLayoutRootIndex(document);

    if (scene.transformDirty.size > 0) {
        const transformDirty = new Set(scene.transformDirty);
        const propagated = collectDirtyNodes(graph, transformDirty);
        const dirtyPartitions = collectDirtyPartitions(scene, propagated);
        const visiblePartitions = collectVisiblePartitions(
            scene,
            resolveViewportBounds(runtime),
        );
        const activePartitions = new Set(
            [...dirtyPartitions].filter((partitionId) => visiblePartitions.has(partitionId)),
        );
        const results = schedulePartitions({
            partitions: [...activePartitions]
                .sort()
                .map((partitionId) => scene.partitions?.get(partitionId))
                .filter(Boolean),
            layers,
            dirtyNodes: propagated,
            graph,
            segments: scene.segments,
            nodeToSegment: scene.nodeToSegment,
            segmentGraph: scene.segmentGraph,
            document,
            runtime,
        });

        for (const nodeId of Object.keys(results).sort()) {
            scene.computed[nodeId] = results[nodeId];
            scene.indexDirty.add(nodeId);
        }

        for (const partitionId of [...activePartitions].sort()) {
            const partition = scene.partitions?.get(partitionId);
            if (partition) {
                partition.dirty = false;
            }
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

    updatePartitionBounds(scene);

    return runtime;
}
