import { attachNode } from './attachNode.js';

export function reparentNode({ nodes = {}, rootIds = [], parentId, nodeId, nodeIds, index }) {
    return attachNode({
        nodes,
        rootIds,
        parentId,
        nodeId,
        nodeIds,
        index,
    });
}
