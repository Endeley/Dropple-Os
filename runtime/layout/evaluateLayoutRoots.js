import { evaluateNode } from '@/runtime/scene/evaluateNode.js';

function evaluateLayoutTree({ rootId, document, runtime }) {
    const nodes = document?.sceneGraph?.nodes || {};
    const queue = [rootId];
    const visited = new Set();

    while (queue.length) {
        const nodeId = queue.shift();
        if (!nodeId || visited.has(nodeId)) continue;
        visited.add(nodeId);

        evaluateNode({
            nodeId,
            document,
            runtime,
        });

        const children = Array.isArray(nodes[nodeId]?.children)
            ? [...nodes[nodeId].children].sort()
            : [];

        for (const childId of children) {
            queue.push(childId);
        }
    }
}

export function evaluateLayoutRoots({ roots = [], document, runtime }) {
    for (const rootId of roots) {
        evaluateLayoutTree({
            rootId,
            document,
            runtime,
        });
    }
}
