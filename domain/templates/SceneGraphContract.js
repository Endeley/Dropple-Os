// domain/templates/SceneGraphContract.js

export function validateSceneGraph(graph) {
    if (!graph || typeof graph !== 'object') {
        throw new Error('SceneGraph must be an object.');
    }

    const { rootId, nodes, tree } = graph;

    if (!rootId || typeof rootId !== 'string') {
        throw new Error('SceneGraph must have a valid rootId.');
    }

    if (!Array.isArray(nodes)) {
        throw new Error('SceneGraph must contain a nodes array.');
    }

    if (!tree || typeof tree !== 'object') {
        throw new Error('SceneGraph must contain a tree object.');
    }

    const nodeMap = new Map();

    for (const node of nodes) {
        if (!node.id || typeof node.id !== 'string') {
            throw new Error('Each node must have a valid string id.');
        }

        if (!node.type || typeof node.type !== 'string') {
            throw new Error(`Node ${node.id} must have a valid type.`);
        }

        if (nodeMap.has(node.id)) {
            throw new Error(`Duplicate node id detected: ${node.id}`);
        }

        nodeMap.set(node.id, node);
    }

    if (!nodeMap.has(rootId)) {
        throw new Error('rootId must exist in nodes array.');
    }

    for (const parentId of Object.keys(tree)) {
        if (!nodeMap.has(parentId)) {
            throw new Error(`Tree references unknown parent node: ${parentId}`);
        }

        const children = tree[parentId];

        if (!Array.isArray(children)) {
            throw new Error(`Children of ${parentId} must be an array.`);
        }

        for (const childId of children) {
            if (!nodeMap.has(childId)) {
                throw new Error(`Tree references unknown child node: ${childId}`);
            }
        }
    }
}
