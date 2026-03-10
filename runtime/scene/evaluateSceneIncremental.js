import { computeDirtyNodes } from './computeDirtyNodes.js';
import { buildDependencyGraph } from './buildDependencyGraph.js';
import { topologicalSort } from './topologicalSort.js';
import { evaluateNode } from './evaluateNode.js';

export function evaluateSceneIncremental({ event, document, runtime = {} }) {
    const dirty = computeDirtyNodes({ event, document });
    const graph = buildDependencyGraph(document);
    const order = topologicalSort(graph);

    for (const nodeId of order) {
        if (dirty.has(nodeId)) {
            evaluateNode({
                nodeId,
                document,
                runtime,
            });
        }
    }

    return runtime;
}
