import { evaluateNode } from '../evaluateNode.js';

export function runPartitionTask(task) {
    const {
        nodes,
        layers,
        document,
        runtime,
    } = task;
    const results = {};
    const nodeSet = new Set(nodes);

    for (const layer of layers) {
        for (const nodeId of layer) {
            if (!nodeSet.has(nodeId)) continue;

            const nextEntry = evaluateNode({
                nodeId,
                document,
                runtime,
            });

            if (nextEntry) {
                results[nodeId] = nextEntry;
            }
        }
    }

    return results;
}
