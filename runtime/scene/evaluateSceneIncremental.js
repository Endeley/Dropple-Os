import { computeDirtyNodes } from './computeDirtyNodes.js';
import { buildDependencyGraph } from './buildDependencyGraph.js';
import { topologicalSort } from './topologicalSort.js';
import { propagateDirtyNodes } from './propagateDirtyNodes.js';
import { evaluateNode } from './evaluateNode.js';

export function evaluateSceneIncremental({ event, document, runtime = {} }) {
    const dirty = computeDirtyNodes({ event, document });
    const graph = buildDependencyGraph(document);
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
