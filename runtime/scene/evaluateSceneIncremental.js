import { computeDirtyNodes } from './computeDirtyNodes.js';
import { buildDependencyGraph } from './buildDependencyGraph.js';
import { topologicalSort } from './topologicalSort.js';
import { propagateDirtyNodes } from './propagateDirtyNodes.js';
import { buildLayoutRootIndex } from './layoutRootIndex.js';
import { ensureSceneCache } from './sceneCache.js';
import { evaluateNode } from './evaluateNode.js';

export function evaluateSceneIncremental({ event, document, runtime = {} }) {
    const scene = ensureSceneCache(runtime);
    const dirty = computeDirtyNodes({ event, document });
    const graph =
        scene.dependencyGraph ||
        (scene.dependencyGraph = buildDependencyGraph(document));
    scene.layoutRoots =
        scene.layoutRoots.size
            ? scene.layoutRoots
            : buildLayoutRootIndex(document);
    const propagated = propagateDirtyNodes(dirty, graph);
    const order = topologicalSort(graph);

    for (const nodeId of order) {
        if (propagated.has(nodeId)) {
            evaluateNode({
                nodeId,
                document,
                runtime,
            });
        }
    }

    return runtime;
}
